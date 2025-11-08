import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  // Detectar si es bcrypt (empieza con $2b$) o scrypt (contiene punto)
  if (stored.startsWith('$2b$') || stored.startsWith('$2a$')) {
    // Es bcrypt - importar bcrypt dinámicamente
    const bcrypt = await import('bcrypt');
    return await bcrypt.compare(supplied, stored);
  } else {
    // Es scrypt
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'xtask-session-secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: 'identifier' }, // Cambiar de 'username' a 'identifier'
      async (identifier, password, done) => {
        try {
          console.log('🔐 Login attempt:', { identifier });
          const user = await storage.getUserByUsername(identifier);
          console.log('👤 User found:', user ? 'YES' : 'NO');
          
          if (!user) {
            console.log('❌ User not found');
            return done(null, false);
          }
          
          const passwordValid = await comparePasswords(password, user.password);
          console.log('🔑 Password valid:', passwordValid ? 'YES' : 'NO');
          
          if (!passwordValid) {
            console.log('❌ Invalid password');
            return done(null, false);
          }
          
          console.log('✅ Login successful');
          return done(null, user);
        } catch (error) {
          console.error('❌ Login error:', error);
          return done(error);
        }
      }
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        const userWithoutPassword = { ...user };
        delete (userWithoutPassword as any).password;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ message: "Invalid credentials" });
      
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        const userWithoutPassword = { ...user };
        delete (userWithoutPassword as any).password;
        // Retornar en el formato esperado por el frontend
        res.status(200).json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userWithoutPassword = { ...req.user };
    delete (userWithoutPassword as any).password;
    res.json(userWithoutPassword);
  });
}
