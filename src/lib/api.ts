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
}

export const apiClient = new ApiClient();
