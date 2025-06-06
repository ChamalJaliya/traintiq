// --- Nested Interfaces ---

/**
 * Interface for geographical location data, including latitude, longitude, and address.
 */
export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
}

/**
 * Interface for a company's social media profile.
 */
export interface SocialMediaProfile {
  platform: string; // e.g., "linkedin", "twitter", "facebook"
  url: string;
  followers?: number; // Optional follower count
}

/**
 * Interface for a single year's financial data.
 */
export interface FinancialYearData {
  year: number;
  revenue: number;
  profit: number;
  currency: string; // e.g., "USD", "EUR"
}

/**
 * Interface for a company's funding round details.
 */
export interface FundingRound {
  date: Date;
  roundType: string; // e.g., "Seed", "Series A", "Series B"
  amount: number;
  investors: string[]; // List of investor names
  valuation?: number; // Optional valuation at the time of funding round
}

/**
 * Interface for a key person within the company (e.g., executive, co-founder).
 */
export interface KeyPerson {
  name: string;
  title: string;
  linkedinUrl?: string; // Optional LinkedIn profile URL
  // Additional fields could be added here if needed, e.g., 'pay', 'exercised', 'yearBorn'
}

/**
 * Interface for a product or service offered by the company.
 */
export interface ProductService {
  name: string;
  category: string; // e.g., "SaaS Solution", "Data Integration Platform"
  description: string;
  tags?: string[]; // Optional tags for categorization
  launchDate?: Date; // Optional launch date
}

// --- Main CompanyProfile Interface ---

/**
 * The main interface for a comprehensive Company Profile.
 * This structure mirrors the detailed dummy data and includes various aspects of company information.
 */
export interface CompanyProfile {
  _id?: string; // Unique identifier (e.g., MongoDB ID), optional for new profiles

  /** Basic identifying information about the company. */
  basicInfo?: {
    legalName: string;
    tradingName?: string; // Name used for business operations
    dba?: string; // "Doing Business As" name
    logoUrl?: string;
    foundedDate?: Date; // Date the company was founded
    incorporationDate?: Date; // Date the company was legally incorporated
    companyType?: string; // e.g., "private", "public", "non-profit"
    industryCodes?: string[]; // e.g., NAICS, SIC codes
  };

  /** Operational details of the company. */
  operational?: {
    headquarters?: GeoLocation; // Primary headquarters location
    locations?: GeoLocation[]; // Other office locations
    employeeCount?: number;
    employeeRange?: string; // e.g., "1-10", "1,001-5,000"
    operatingCountries?: string[]; // ISO country codes where the company operates
    subsidiaries?: string[];
  };

  /** Contact information for the company. */
  contact?: {
    primaryPhone?: string;
    tollFreePhone?: string;
    email?: string;
    investorEmail?: string;
    socialMedia?: SocialMediaProfile[];
  };

  /** Financial overview and history of the company. */
  financials?: {
    stockSymbol?: string; // e.g., "GOOG", "PRIVATE" if not publicly traded
    financialData?: FinancialYearData[]; // Annual revenue/profit data
    fundingRounds?: FundingRound[]; // Details of funding rounds received
  };

  /** Descriptive information about the company's purpose and identity. */
  descriptive?: {
    mission?: string;
    vision?: string;
    tagline?: string;
    description?: string;
    coreValues?: string[]; // Company's core values
    keywords?: string[]; // Relevant keywords for search/categorization
  };

  /** Relationships with key individuals, offerings, clients, partners, and competitors. */
  relationships?: {
    keyPeople?: KeyPerson[]; // Key executives or founders
    productsServices?: ProductService[]; // List of products and services offered
    clients?: string[]; // Key clients
    partners?: string[]; // Key partners
    competitors?: string[]; // Main competitors
  };

  /** Information related to company leadership and compliance. */
  governance?: {
    ceo?: { name: string; title: string; };
    boardMembers?: { name: string; title: string; }[];
    certifications?: string[];
  };

  /** Details about the company's online and digital presence. */
  digitalPresence?: {
    websiteUrl?: string;
    careersUrl?: string;
    techStack?: string[]; // Technologies used by the company
    monthlyVisitors?: number; // Estimated website monthly visitors
  };

  /** Information about the data source, particularly if scraped. */
  scrapedData?: {
    sources?: string[]; // URLs from which data was scraped
    lastScraped?: Date;
    confidenceScore?: number; // Confidence score of the scraped data accuracy (0-1)
  };

  /** General metadata about the profile record itself. */
  metadata?: {
    lastUpdated?: Date;
    created?: Date;
    dataSources?: string[]; // e.g., ["scraped", "manual-entry", "api-integration"]
  };

  /**
   * IMPORTANT: Custom sections for dynamic content, placed at the top-level.
   * This allows users to add arbitrary key-value pairs for additional information.
   */
  customSections?: { [key: string]: string };

  // --- Frontend UI State (typically not persisted to backend) ---
  isLoading?: boolean; // Flag for UI loading state
  isFavorite?: boolean; // Flag if the profile is marked as a favorite
}

/**
 * Interface for the request payload to generate a company profile.
 * This is used when sending data from the frontend to the backend's generation endpoint.
 */
export interface ProfileGenerationRequest {
  url: string; // The company website URL to scrape
  customInstructions?: string; // Optional instructions for the AI model
}
