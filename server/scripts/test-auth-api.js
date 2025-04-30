#!/usr/bin/env node

/*
 * Script para probar la API de autenticación
 * 
 * Uso:
 *   node test-auth-api.js login admin admin123
 *   node test-auth-api.js validate <token>
 *   node test-auth-api.js me <token>
 *   node test-auth-api.js logout <token>
 */

import fetch from 'node-fetch';

// Configuración
const API_BASE = 'http://localhost:5000/api/auth';

// Obtener argumentos
const [action, ...args] = process.argv.slice(2);

// Funciones de prueba
const testLogin = async (username, password) => {
  if (!username || !password) {
    console.error('Uso: node test-auth-api.js login <username> <password>');
    process.exit(1);
  }
  
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: username,
        password
      })
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.token) {
      console.log('\n=== TOKEN ===');
      console.log(data.token);
      console.log('=============');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const testValidateToken = async (token) => {
  if (!token) {
    console.error('Uso: node test-auth-api.js validate <token>');
    process.exit(1);
  }
  
  try {
    const response = await fetch(`${API_BASE}/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const testGetMe = async (token) => {
  if (!token) {
    console.error('Uso: node test-auth-api.js me <token>');
    process.exit(1);
  }
  
  try {
    const response = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const testLogout = async (token) => {
  if (!token) {
    console.error('Uso: node test-auth-api.js logout <token>');
    process.exit(1);
  }
  
  try {
    const response = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Ejecutar la acción correspondiente
switch (action) {
  case 'login':
    await testLogin(args[0], args[1]);
    break;
  case 'validate':
    await testValidateToken(args[0]);
    break;
  case 'me':
    await testGetMe(args[0]);
    break;
  case 'logout':
    await testLogout(args[0]);
    break;
  default:
    console.log('Acciones disponibles: login, validate, me, logout');
    break;
}