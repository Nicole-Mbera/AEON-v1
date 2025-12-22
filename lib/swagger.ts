// Swagger configuration - minimal version
// API documentation is handled by API routes directly

export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AEON API',
    version: '1.0.0',
    description: 'AEON Education Platform API',
  },
  servers: [
    {
      url: '/api',
      description: 'API Server',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
      },
    },
  },
};
