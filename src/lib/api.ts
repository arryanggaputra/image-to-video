// API types (matching server schema)
export interface Domain {
  id: number;
  url: string;
  status: "pending" | "processing" | "generating" | "complete" | "error";
  createdAt: Date;
  updatedAt: Date;
}

export interface NewDomain {
  url: string;
  status?: "pending" | "processing" | "generating" | "complete" | "error";
}

export interface Product {
  id: number;
  domainId: number;
  title: string;
  description: string;
  url: string;
  images: string[];
  videoStatus: "unavailable" | "processing" | "finish" | "error";
  videoUrl?: string | null;
  videoTaskId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewProduct {
  domainId: number;
  title: string;
  description: string;
  url: string;
  images: string[];
}

export interface DomainWithProducts extends Domain {
  products: Product[];
  productCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

// API client
class ApiClient {
  private baseUrl = "/api";

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "API request failed");
    }

    return data.data;
  }

  // Get all domains
  async getDomains(): Promise<Domain[]> {
    return this.request<Domain[]>("/domains");
  }

  // Get single domain
  async getDomain(id: number): Promise<Domain> {
    return this.request<Domain>(`/domains/${id}`);
  }

  // Create domain
  async createDomain(domain: NewDomain): Promise<Domain> {
    return this.request<Domain>("/domains", {
      method: "POST",
      body: JSON.stringify(domain),
    });
  }

  // Update domain
  async updateDomain(id: number, domain: Partial<NewDomain>): Promise<Domain> {
    return this.request<Domain>(`/domains/${id}`, {
      method: "PUT",
      body: JSON.stringify(domain),
    });
  }

  // Delete domain
  async deleteDomain(id: number): Promise<void> {
    await this.request<void>(`/domains/${id}`, {
      method: "DELETE",
    });
  }

  // Get domain with products
  async getDomainWithProducts(id: number): Promise<DomainWithProducts> {
    return this.request<DomainWithProducts>(`/domains/${id}/with-products`);
  }

  // Get all products
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>("/products");
  }

  // Get products by domain
  async getProductsByDomain(domainId: number): Promise<Product[]> {
    return this.request<Product[]>(`/products/domain/${domainId}`);
  }

  // Get single product
  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  // Create product
  async createProduct(product: NewProduct): Promise<Product> {
    return this.request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  }

  // Create multiple products
  async createBulkProducts(products: NewProduct[]): Promise<Product[]> {
    return this.request<Product[]>("/products/bulk", {
      method: "POST",
      body: JSON.stringify(products),
    });
  }

  // Update product
  async updateProduct(
    id: number,
    product: Partial<NewProduct>
  ): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
  }

  // Delete product
  async deleteProduct(id: number): Promise<void> {
    await this.request<void>(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // Video generation methods
  async generateVideo(
    productId: number
  ): Promise<{ taskId: string; status: string; message: string }> {
    return this.request<{ taskId: string; status: string; message: string }>(
      `/videos/generate/${productId}`,
      {
        method: "POST",
      }
    );
  }

  async getVideoStatus(productId: number): Promise<{
    videoStatus: "unavailable" | "processing" | "finish" | "error";
    videoUrl?: string | null;
    taskId?: string | null;
    taskStatus?: string;
    statusMessage?: string;
    error?: string;
  }> {
    return this.request<{
      videoStatus: "unavailable" | "processing" | "finish" | "error";
      videoUrl?: string | null;
      taskId?: string | null;
      taskStatus?: string;
      statusMessage?: string;
      error?: string;
    }>(`/videos/status/${productId}`);
  }

  async getDomainVideos(domainId: number): Promise<Product[]> {
    return this.request<Product[]>(`/videos/domain/${domainId}`);
  }
}

export const apiClient = new ApiClient();
