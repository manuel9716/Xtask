import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ArrowLeft, 
  FileJson, 
  FileDown, 
  Copy, 
  Check,
  Database,
  Users,
  Briefcase,
  ClipboardList,
  DollarSign,
  PieChart,
  BookOpen,
  Layers
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/layouts/main-layout";

interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  parameters: any;
  response: string;
  auth_required: boolean;
}

interface ApiModule {
  name: string;
  slug: string;
  description: string;
  endpoints: ApiEndpoint[];
}

interface ApiReference {
  title: string;
  version: string;
  description: string;
  baseUrl: string;
  modules: ApiModule[];
  auth: {
    type: string;
    header: string;
    format: string;
    expiration: string;
  };
  status_codes: Record<string, string>;
  pagination: {
    query_params: Record<string, string>;
  };
  timestamps: {
    format: string;
    example: string;
  };
}

const getMethodColor = (method: string) => {
  switch (method.toUpperCase()) {
    case "GET":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "POST":
      return "bg-green-100 text-green-800 border-green-200";
    case "PUT":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "PATCH":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "DELETE":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getModuleIcon = (slug: string) => {
  switch (slug) {
    case "auth":
      return <Users className="h-5 w-5" />;
    case "projects":
      return <Briefcase className="h-5 w-5" />;
    case "tasks":
      return <ClipboardList className="h-5 w-5" />;
    case "employees":
      return <Users className="h-5 w-5" />;
    case "suppliers":
      return <Database className="h-5 w-5" />;
    case "transactions":
      return <DollarSign className="h-5 w-5" />;
    case "budgets":
      return <DollarSign className="h-5 w-5" />;
    case "payroll":
      return <DollarSign className="h-5 w-5" />;
    case "training":
      return <BookOpen className="h-5 w-5" />;
    case "microlearning":
      return <BookOpen className="h-5 w-5" />;
    case "dashboard":
      return <PieChart className="h-5 w-5" />;
    case "users":
      return <Users className="h-5 w-5" />;
    default:
      return <Layers className="h-5 w-5" />;
  }
};

const ApiDocumentation: React.FC = () => {
  const [apiData, setApiData] = useState<ApiReference | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // En producción, esto podría ser una llamada fetch real a api-references.json
    // pero para simplificar, importamos directamente el archivo
    const fetchData = async () => {
      try {
        const response = await fetch("/docs/api-references.json");
        if (!response.ok) {
          throw new Error("Error al cargar documentación de API");
        }
        const data = await response.json();
        setApiData(data);
        setLoading(false);
      } catch (err) {
        setError("Error al cargar la documentación de API. Por favor, intenta más tarde.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: "Copiado",
      description: "Código copiado al portapapeles",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredModules = apiData?.modules.filter(
    (module) =>
      module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.endpoints.some(
        (endpoint) =>
          endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
          endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const selectedModuleData = selectedModule
    ? apiData?.modules.find((m) => m.slug === selectedModule)
    : null;

  const handleDownloadJson = () => {
    if (!apiData) return;

    const dataStr = JSON.stringify(apiData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "xtask-api-reference.json");
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-primary rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-xl font-semibold text-red-600 mb-4">{error}</h2>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold">
              {apiData?.title} <Badge>{apiData?.version}</Badge>
            </h1>
            <p className="text-gray-500 mt-2">{apiData?.description}</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={handleDownloadJson}>
              <FileDown className="mr-2 h-4 w-4" /> Descargar JSON
            </Button>
            <Button variant="outline" onClick={() => window.open("/docs/api-references.md", "_blank")}>
              <FileJson className="mr-2 h-4 w-4" /> Ver Markdown
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Card>
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar APIs..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="border rounded-md mb-4">
                  <div 
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${!selectedModule ? 'bg-gray-50 font-medium' : ''}`}
                    onClick={() => setSelectedModule(null)}
                  >
                    Todos los módulos
                  </div>
                  {filteredModules?.map((module) => (
                    <div
                      key={module.slug}
                      className={`p-3 cursor-pointer hover:bg-gray-50 border-t flex items-center ${
                        selectedModule === module.slug ? "bg-gray-50 font-medium" : ""
                      }`}
                      onClick={() => setSelectedModule(module.slug)}
                    >
                      {getModuleIcon(module.slug)}
                      <span className="ml-2">{module.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 lg:col-span-3">
            {selectedModule ? (
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedModule(null)}
                  className="mb-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver a todos los módulos
                </Button>

                {selectedModuleData && (
                  <>
                    <Card className="mb-8">
                      <CardHeader>
                        <div className="flex items-center">
                          {getModuleIcon(selectedModuleData.slug)}
                          <CardTitle className="ml-2">{selectedModuleData.name}</CardTitle>
                        </div>
                        <CardDescription>
                          {selectedModuleData.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <h3 className="text-xl font-semibold mb-4">Endpoints</h3>

                    <Accordion type="single" collapsible className="mb-8">
                      {selectedModuleData.endpoints.map((endpoint, index) => (
                        <AccordionItem
                          key={`${endpoint.method}-${endpoint.path}-${index}`}
                          value={`${endpoint.method}-${endpoint.path}-${index}`}
                        >
                          <AccordionTrigger className="hover:bg-gray-50 p-4 rounded-md">
                            <div className="flex items-center">
                              <Badge
                                variant="outline"
                                className={`mr-4 ${getMethodColor(endpoint.method)}`}
                              >
                                {endpoint.method.toUpperCase()}
                              </Badge>
                              <div className="font-mono text-sm">{apiData?.baseUrl}{endpoint.path}</div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 py-4">
                            <p className="mb-4">{endpoint.description}</p>

                            <Tabs
                              defaultValue="info"
                              className="mb-6"
                            >
                              <TabsList>
                                <TabsTrigger value="info">Información</TabsTrigger>
                                <TabsTrigger value="params">Parámetros</TabsTrigger>
                                <TabsTrigger value="response">Respuesta</TabsTrigger>
                                <TabsTrigger value="example">Ejemplo</TabsTrigger>
                              </TabsList>
                              <TabsContent value="info" className="p-4 bg-gray-50 rounded-md mt-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">URL:</span>
                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded-md">
                                      {apiData?.baseUrl}{endpoint.path}
                                    </code>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">Método:</span>
                                    <Badge
                                      variant="outline"
                                      className={getMethodColor(endpoint.method)}
                                    >
                                      {endpoint.method.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">Autenticación requerida:</span>
                                    <Badge variant={endpoint.auth_required ? "default" : "outline"}>
                                      {endpoint.auth_required ? "Sí" : "No"}
                                    </Badge>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="params" className="p-4 bg-gray-50 rounded-md mt-4">
                                {Object.keys(endpoint.parameters).length === 0 ? (
                                  <p className="text-gray-500">No requiere parámetros</p>
                                ) : (
                                  <div className="space-y-4">
                                    {Object.entries(endpoint.parameters).map(([type, params]) => (
                                      <div key={type}>
                                        <h4 className="font-semibold capitalize mb-2">{type}:</h4>
                                        <div className="bg-white p-3 rounded-md border">
                                          <pre className="text-sm overflow-auto">
                                            {JSON.stringify(params, null, 2)}
                                          </pre>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </TabsContent>
                              <TabsContent value="response" className="p-4 bg-gray-50 rounded-md mt-4">
                                <p className="mb-2 font-medium">Respuesta:</p>
                                <div className="bg-white p-3 rounded-md border">
                                  {typeof endpoint.response === "string" ? (
                                    <p>{endpoint.response}</p>
                                  ) : (
                                    <pre className="text-sm overflow-auto">
                                      {JSON.stringify(endpoint.response, null, 2)}
                                    </pre>
                                  )}
                                </div>
                              </TabsContent>
                              <TabsContent value="example" className="p-4 bg-gray-50 rounded-md mt-4">
                                <div className="mb-4">
                                  <h4 className="font-semibold mb-2">Ejemplo de solicitud:</h4>
                                  <div className="bg-black text-white p-4 rounded-md relative">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                      onClick={() => {
                                        const code = `curl -X ${endpoint.method.toUpperCase()} ${
                                          endpoint.auth_required
                                            ? '-H "Authorization: Bearer YOUR_TOKEN" '
                                            : ""
                                        }"http://localhost:5000${apiData?.baseUrl}${endpoint.path}"${
                                          endpoint.method.toUpperCase() === "GET"
                                            ? ""
                                            : Object.keys(endpoint.parameters).includes("body")
                                            ? ' \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    // Request body\n  }\''
                                            : ""
                                        }`;
                                        handleCopyCode(code);
                                      }}
                                    >
                                      {copied ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <pre className="text-sm overflow-auto whitespace-pre-wrap">
{`curl -X ${endpoint.method.toUpperCase()} ${
  endpoint.auth_required
    ? '-H "Authorization: Bearer YOUR_TOKEN" '
    : ""
}"http://localhost:5000${apiData?.baseUrl}${endpoint.path}"${
  endpoint.method.toUpperCase() === "GET"
    ? ""
    : Object.keys(endpoint.parameters).includes("body")
    ? ' \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    // Request body\n  }\''
    : ""
}`}
                                    </pre>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </>
                )}
              </div>
            ) : (
              <div>
                <Tabs defaultValue={activeTab} onValueChange={(v) => setActiveTab(v)}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="overview">Visión General</TabsTrigger>
                    <TabsTrigger value="modules">Módulos</TabsTrigger>
                    <TabsTrigger value="auth">Autenticación</TabsTrigger>
                    <TabsTrigger value="codes">Códigos de Estado</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Información General</CardTitle>
                        <CardDescription>
                          Documentación completa de la API XTask
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold mb-2">URL Base</h3>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded-md">
                              http://localhost:5000{apiData?.baseUrl}
                            </code>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Versión</h3>
                            <p>{apiData?.version}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Formato de Respuesta</h3>
                            <p>Todas las respuestas son en formato JSON.</p>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Paginación</h3>
                            <p>
                              Para endpoints que devuelven listas, puedes usar los
                              parámetros <code>page</code> y <code>pageSize</code>.
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Ejemplo: <code>?page=1&pageSize=20</code>
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Timestamps</h3>
                            <p>
                              Formato: {apiData?.timestamps.format}
                              <br />
                              Ejemplo: <code>{apiData?.timestamps.example}</code>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Total de Endpoints</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">
                            {apiData?.modules.reduce(
                              (acc, module) => acc + module.endpoints.length,
                              0
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Módulos</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">
                            {apiData?.modules.length}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Última Actualización</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl">
                            {new Date().toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="modules" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredModules?.map((module) => (
                        <Card
                          key={module.slug}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedModule(module.slug)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                {getModuleIcon(module.slug)}
                                <CardTitle className="ml-2">{module.name}</CardTitle>
                              </div>
                              <Badge>{module.endpoints.length}</Badge>
                            </div>
                            <CardDescription className="line-clamp-2">
                              {module.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-1">
                              {module.endpoints.slice(0, 3).map((endpoint, i) => (
                                <div
                                  key={`${endpoint.method}-${endpoint.path}-${i}`}
                                  className="flex items-center text-sm text-gray-600"
                                >
                                  <Badge
                                    variant="outline"
                                    className={`mr-2 w-14 flex justify-center ${getMethodColor(
                                      endpoint.method
                                    )}`}
                                  >
                                    {endpoint.method.toUpperCase()}
                                  </Badge>
                                  <div className="truncate">
                                    {endpoint.path}
                                  </div>
                                </div>
                              ))}
                              {module.endpoints.length > 3 && (
                                <div className="text-sm text-gray-500 italic">
                                  + {module.endpoints.length - 3} más
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="auth" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Autenticación</CardTitle>
                        <CardDescription>
                          Información sobre el sistema de autenticación
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Tipo de Autenticación</h3>
                          <p>{apiData?.auth.type}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Cabecera</h3>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded-md">
                            {apiData?.auth.header}: {apiData?.auth.format}
                          </code>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Expiración</h3>
                          <p>{apiData?.auth.expiration}</p>
                        </div>
                        <div className="pt-4">
                          <h3 className="font-semibold mb-4">Endpoints de Autenticación</h3>
                          <div className="space-y-3">
                            {apiData?.modules
                              .find((m) => m.slug === "auth")
                              ?.endpoints.map((endpoint, i) => (
                                <div
                                  key={`${endpoint.method}-${endpoint.path}-${i}`}
                                  className="flex items-center"
                                >
                                  <Badge
                                    variant="outline"
                                    className={`mr-3 w-16 flex justify-center ${getMethodColor(
                                      endpoint.method
                                    )}`}
                                  >
                                    {endpoint.method.toUpperCase()}
                                  </Badge>
                                  <div className="font-mono text-sm">
                                    {apiData?.baseUrl}
                                    {endpoint.path}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="codes" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Códigos de Estado HTTP</CardTitle>
                        <CardDescription>
                          Significado de los códigos de estado devueltos por la API
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(apiData?.status_codes || {}).map(
                            ([code, description]) => (
                              <div
                                key={code}
                                className="flex items-start border rounded-md p-3"
                              >
                                <Badge
                                  className={
                                    code.startsWith("2")
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : code.startsWith("4")
                                      ? "bg-amber-100 text-amber-800 border-amber-200"
                                      : code.startsWith("5")
                                      ? "bg-red-100 text-red-800 border-red-200"
                                      : "bg-blue-100 text-blue-800 border-blue-200"
                                  }
                                >
                                  {code}
                                </Badge>
                                <span className="ml-3">{description}</span>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ApiDocumentation;