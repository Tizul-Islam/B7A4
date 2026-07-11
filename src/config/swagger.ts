import swaggerJSDoc from "swagger-jsdoc";
import config from "./index.js";

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GearUp Backend API",
      version: "1.0.0",
      description: "API documentation for GearUp sports & outdoor gear rental marketplace.",
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
          description: "Enter your raw JWT access token",
        },
      },
      schemas: {
        StandardSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            statusCode: { type: "integer", example: 200 },
            message: { type: "string", example: "Request completed successfully" },
            data: { type: "object" },
          },
        },
        StandardError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Human-readable summary of what went wrong" },
            errorDetails: {
              type: "object",
              properties: {
                statusCode: { type: "integer", example: 400 },
                errorSource: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      path: { type: "string", example: "email" },
                      message: { type: "string", example: "Email is already registered" },
                    },
                  },
                },
                stack: { type: "string", example: "Only included in development mode" },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      "/api/auth/register": {
        post: {
          summary: "Register a new Customer or Provider",
          tags: ["Auth"],
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password", "role"],
                  properties: {
                    name: { type: "string", example: "Jane Doe" },
                    email: { type: "string", format: "email", example: "jane@example.com" },
                    password: { type: "string", format: "password", example: "password123" },
                    role: { type: "string", enum: ["CUSTOMER", "PROVIDER"], example: "CUSTOMER" },
                    phone: { type: "string", example: "+8801700000000" },
                    address: { type: "string", example: "Dhaka, Bangladesh" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User registered successfully" },
            400: { description: "Validation error" },
            409: { description: "Email already exists" },
          },
        },
      },
      "/api/auth/login": {
        post: {
          summary: "Log in with email and password",
          tags: ["Auth"],
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email", example: "jane@example.com" }, 
                    password: { type: "string", format: "password", example: "password123" }, 
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "User logged in successfully" },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/api/auth/refresh-token": {
        post: {
          summary: "Retrieve new access token using refresh token",
          tags: ["Auth"],
          security: [],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    refreshToken: { type: "string", example: "eyJhbGciOi..." },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Token refreshed successfully" },
            401: { description: "Invalid/Expired refresh token" },
          },
        },
      },
      "/api/auth/me": {
        get: {
          summary: "Get current logged-in user profile",
          tags: ["Auth"],
          responses: {
            200: { description: "Profile retrieved successfully" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/users/me": {
        get: {
          summary: "Get own user profile",
          tags: ["Users"],
          responses: {
            200: { description: "Profile retrieved" },
            401: { description: "Unauthorized" },
          },
        },
        put: {
          summary: "Update own user profile",
          tags: ["Users"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Jane Smith" },
                    phone: { type: "string", example: "+8801800000000" },
                    address: { type: "string", example: "Chittagong, Bangladesh" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Profile updated" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/categories": {
        get: {
          summary: "Get all categories",
          tags: ["Categories"],
          security: [],
          responses: {
            200: { description: "Categories retrieved" },
          },
        },
      },
      "/api/gear": {
        get: {
          summary: "Get paginated, filtered gear list",
          tags: ["Gear"],
          security: [],
          parameters: [
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "category", in: "query", schema: { type: "string" } },
            { name: "minPrice", in: "query", schema: { type: "number" } },
            { name: "maxPrice", in: "query", schema: { type: "number" } },
            { name: "brand", in: "query", schema: { type: "string" } },
            { name: "isAvailable", in: "query", schema: { type: "string", enum: ["true", "false"] } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
            { name: "sortBy", in: "query", schema: { type: "string", default: "createdAt" } },
            { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
          ],
          responses: {
            200: { description: "Gear list retrieved successfully" },
          },
        },
      },
      "/api/gear/{id}": {
        get: {
          summary: "Get gear details",
          tags: ["Gear"],
          security: [],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: {
            200: { description: "Gear details retrieved" },
            404: { description: "Gear not found" },
          },
        },
      },
      "/api/gear/{id}/reviews": {
        get: {
          summary: "Get reviews for a gear item",
          tags: ["Gear"],
          security: [],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: {
            200: { description: "Gear reviews retrieved" },
          },
        },
      },
      "/api/provider/gear": {
        post: {
          summary: "Add gear to provider inventory",
          tags: ["Provider"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "description", "brand", "categoryId", "images", "pricePerDay", "stockQuantity", "condition"],
                  properties: {
                    name: { type: "string", example: "Mountain Bike" },
                    description: { type: "string", example: "High quality aluminum frame bike" },
                    brand: { type: "string", example: "Trek" },
                    categoryId: { type: "string", format: "uuid", example: "categoryId-uuid" },
                    images: { type: "array", items: { type: "string" }, example: ["https://example.com/bike.jpg"] },
                    pricePerDay: { type: "number", example: 25 },
                    stockQuantity: { type: "integer", example: 5 },
                    condition: { type: "string", enum: ["NEW", "GOOD", "FAIR"], example: "NEW" },
                    isAvailable: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Gear item added" },
            403: { description: "Forbidden - Providers only" },
          },
        },
      },
      "/api/provider/gear/{id}": {
        put: {
          summary: "Update own gear listing",
          tags: ["Provider"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    pricePerDay: { type: "number" },
                    stockQuantity: { type: "integer" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Gear updated" },
            403: { description: "Forbidden - Owner only" },
          },
        },
        delete: {
          summary: "Remove own gear listing",
          tags: ["Provider"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: {
            200: { description: "Gear deleted" },
            400: { description: "Bad Request - Has active rentals" },
            403: { description: "Forbidden - Owner only" },
          },
        },
      },
      "/api/provider/orders": {
        get: {
          summary: "Get incoming orders containing provider's gear",
          tags: ["Provider"],
          responses: {
            200: { description: "Incoming orders retrieved" },
          },
        },
      },
      "/api/provider/orders/{id}": {
        patch: {
          summary: "Update order status",
          tags: ["Provider"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: { type: "string", enum: ["CONFIRMED", "PICKED_UP", "RETURNED"] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Order status updated" },
          },
        },
      },
      "/api/rentals": {
        post: {
          summary: "Create a rental order",
          tags: ["Rentals"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["startDate", "endDate", "items"],
                  properties: {
                    startDate: { type: "string", format: "date-time", example: "2026-08-01T10:00:00Z" },
                    endDate: { type: "string", format: "date-time", example: "2026-08-05T10:00:00Z" },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["gearItemId", "quantity"],
                        properties: {
                          gearItemId: { type: "string", format: "uuid", example: "gear-uuid" },
                          quantity: { type: "integer", example: 1 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Order created successfully" },
          },
        },
        get: {
          summary: "List current user's rental orders",
          tags: ["Rentals"],
          responses: {
            200: { description: "Rentals retrieved" },
          },
        },
      },
      "/api/rentals/{id}": {
        get: {
          summary: "Get rental order details",
          tags: ["Rentals"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: {
            200: { description: "Rental details retrieved" },
          },
        },
      },
      "/api/rentals/{id}/cancel": {
        patch: {
          summary: "Cancel own rental order (while status is PLACED)",
          tags: ["Rentals"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: {
            200: { description: "Order cancelled successfully" },
          },
        },
      },
      "/api/payments/create": {
        post: {
          summary: "Create Stripe PaymentIntent or SSLCommerz Sandbox session",
          tags: ["Payments"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["rentalOrderId", "method"],
                  properties: {
                    rentalOrderId: { type: "string", format: "uuid", example: "order-uuid" },
                    method: { type: "string", enum: ["STRIPE", "SSLCOMMERZ"] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Payment intent/session initialized" },
          },
        },
      },
      "/api/payments/confirm": {
        post: {
          summary: "Public webhook to verify Stripe payments",
          tags: ["Payments"],
          security: [], 
          responses: {
            200: { description: "Webhook received" },
          },
        },
      },
      "/api/payments": {
        get: {
          summary: "Get own payment history",
          tags: ["Payments"],
          responses: {
            200: { description: "Payment history retrieved" },
          },
        },
      },
      "/api/payments/{id}": {
        get: {
          summary: "Get single payment details",
          tags: ["Payments"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: {
            200: { description: "Payment details retrieved" },
          },
        },
      },
      "/api/reviews": {
        post: {
          summary: "Submit review for returned gear item",
          tags: ["Reviews"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["rentalOrderId", "gearItemId", "rating", "comment"],
                  properties: {
                    rentalOrderId: { type: "string", format: "uuid", example: "order-uuid" },
                    gearItemId: { type: "string", format: "uuid", example: "gear-uuid" },
                    rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
                    comment: { type: "string", example: "Excellent bike! Highly recommended." },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Review submitted" },
          },
        },
      },
      "/api/admin/users": {
        get: {
          summary: "Get all platform users",
          tags: ["Admin"],
          responses: {
            200: { description: "Users list retrieved" },
          },
        },
      },
      "/api/admin/users/{id}": {
        patch: {
          summary: "Suspend or activate a user",
          tags: ["Admin"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["activeStatus"],
                  properties: {
                    activeStatus: { type: "string", enum: ["ACTIVE", "SUSPENDED"], example: "SUSPENDED" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "User status updated" },
          },
        },
      },
      "/api/admin/gear": {
        get: {
          summary: "Get all platform gear listings",
          tags: ["Admin"],
          responses: {
            200: { description: "Gear list retrieved" },
          },
        },
      },
      "/api/admin/rentals": {
        get: {
          summary: "Get all platform rental orders",
          tags: ["Admin"],
          responses: {
            200: { description: "Rental orders retrieved" },
          },
        },
      },
      "/api/admin/categories": {
        post: {
          summary: "Create a new category",
          tags: ["Admin"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string", example: "Camping" },
                    description: { type: "string", example: "Tents and camping gear" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Category created" },
          },
        },
      },
      "/api/admin/categories/{id}": {
        patch: {
          summary: "Update category name/description",
          tags: ["Admin"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Category updated" },
          },
        },
        delete: {
          summary: "Delete category (only if unused)",
          tags: ["Admin"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: {
            200: { description: "Category deleted" },
            400: { description: "Category in use" },
          },
        },
      },
      "/api/admin/stats": {
        get: {
          summary: "Retrieve aggregate platform stats",
          tags: ["Admin"],
          responses: {
            200: { description: "Platform stats retrieved" },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
export { default as swaggerUi } from "swagger-ui-express";
