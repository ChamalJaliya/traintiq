import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs'; // 'of' is used for simulating HTTP responses
import { CompanyProfile, ProfileGenerationRequest } from '../../../shared/models/company-profile.model';
// Update model import path


@Injectable({
  providedIn: 'root'
})
export class CompanyProfileService {
  private apiUrl = '/api/company-profiles'; // Mock API base

  constructor(private http: HttpClient) { }

  generateProfile(request: ProfileGenerationRequest): Observable<CompanyProfile> {
    console.log('Simulating backend call for profile generation:', request);

    // --- Mocking API call with your provided detailed dummy data ---
    return new Observable(observer => {
      setTimeout(() => {
        const dummyCompanyProfile: CompanyProfile = {
      // Paste the ENTIRE dummy data object here, as used in generateProfile
      "_id": "65a1b2c3d4e5f6g7h8i9j0k",
      "basicInfo": {
        "legalName": "NexusWave Technologies Inc.",
        "tradingName": "NexusWave",
        "dba": "WaveTech",
        "logoUrl": "https://placehold.co/100x100/2196F3/ffffff?text=NW",
        "foundedDate": new Date("2015-06-15"),
        "incorporationDate": new Date("2015-05-01"),
        "companyType": "private",
        "industryCodes": ["541511", "518210"]
      },
      "operational": {
        "headquarters": {
          "lat": 37.7749,
          "lng": -122.4194,
          "address": "550 Market St, San Francisco, CA 94104, USA"
        },
        "locations": [
          {
            "lat": 40.7128,
            "lng": -74.0060,
            "address": "One Liberty Plaza, New York, NY 10006, USA"
          }
        ],
        "employeeCount": 342,
        "employeeRange": "301-500",
        "operatingCountries": ["US", "CA", "GB", "DE"],
        "subsidiaries": ["WaveTech UK Ltd", "NexusWave Analytics"]
      },
      "contact": {
        "primaryPhone": "+1-415-555-0199",
        "tollFreePhone": "+1-800-555-3482",
        "email": "info@nexuswave.example",
        "investorEmail": "investors@nexuswave.example",
        "socialMedia": [
          {
            "platform": "linkedin",
            "url": "https://linkedin.com/company/nexuswave",
            "followers": 12450
          },
          {
            "platform": "twitter",
            "url": "https://twitter.com/nexuswave",
            "followers": 8765
          }
        ]
      },
      "financials": {
        "stockSymbol": "PRIVATE",
        "financialData": [
          {
            "year": 2023,
            "revenue": 48200000,
            "profit": 7500000,
            "currency": "USD"
          },
          {
            "year": 2022,
            "revenue": 38500000,
            "profit": 5200000,
            "currency": "USD"
          }
        ],
        "fundingRounds": [
          {
            "date": new Date("2021-03-15"),
            "roundType": "Series B",
            "amount": 25000000,
            "investors": ["Sequoia Capital", "Andreessen Horowitz"],
            "valuation": 180000000
          }
        ]
      },
      "descriptive": {
        "mission": "Empower businesses through intelligent data orchestration",
        "vision": "To become the operating system for enterprise data flows",
        "tagline": "The Data Fabric Company",
        "description": "NexusWave provides next-generation data integration platforms that help enterprises unify, process, and analyze data across hybrid cloud environments. Our patented WaveSync technology enables real-time data synchronization at unprecedented scale.",
        "coreValues": ["Innovation", "Customer Obsession", "Data Integrity", "Collaboration"],
        "keywords": ["data integration", "ETL", "cloud computing", "big data"]
      },
      "relationships": {
        "keyPeople": [
          {
            "name": "Dr. Samantha Chen",
            "title": "CEO & Co-Founder",
            "linkedinUrl": "https://linkedin.com/in/samanthachen"
          },
          {
            "name": "Raj Patel",
            "title": "CTO",
            "linkedinUrl": "https://linkedin.com/in/rajpatelcto"
          }
        ],
        "productsServices": [
          {
            "name": "WaveSync Core",
            "category": "Data Integration Platform",
            "description": "Real-time data pipeline orchestration",
            "tags": ["enterprise", "on-premise", "cloud"]
          },
          {
            "name": "WaveFlow Cloud",
            "category": "SaaS Solution",
            "description": "Fully managed data integration service",
            "launchDate": new Date("2022-09-01")
          }
        ],
        "clients": ["Fortune 500 Retailer", "Global Bank Corp", "TechUniverse"],
        "partners": ["AWS", "Snowflake", "Databricks"],
        "competitors": ["Informatica", "Talend", "Fivetran"]
      },
      "governance": {
        "ceo": {
          "name": "Dr. Samantha Chen",
          "title": "Chief Executive Officer"
        },
        "boardMembers": [
          {
            "name": "Michael Johnson",
            "title": "Board Chair (Sequoia Capital)"
          }
        ],
        "certifications": ["SOC 2 Type II", "ISO 27001"]
      },
      "digitalPresence": {
        "websiteUrl": "https://nexuswave.example",
        "careersUrl": "https://nexuswave.example/careers",
        "techStack": ["Angular", "Node.js", "Kubernetes", "PostgreSQL"],
        "monthlyVisitors": 125000
      },
      "scrapedData": {
        "sources": [
          "https://nexuswave.example/about",
          "https://crunchbase.com/nexuswave",
          "https://linkedin.com/company/nexuswave"
        ],
        "lastScraped": new Date("2023-11-15T14:30:00Z"),
        "confidenceScore": 0.92
      },
      "metadata": { // THIS IS THE KEY PART TO INCLUDE
        "lastUpdated": new Date("2023-11-16T09:15:00Z"),
        "created": new Date("2020-01-10T10:00:00Z"),
        "dataSources": ["scraped", "manual-entry"]
      },
      "customSections": {} // Also include this if your model has it and editor uses it
    };
        observer.next(dummyCompanyProfile); // Emit the mock profile
        observer.complete(); // Complete the observable
      }, 2000); // Simulate 2-second delay
    });
  }

  getProfile(id: string): Observable<CompanyProfile> {
    // In a real app, this would fetch from a backend. For now, return a simplified mock.
    console.log(`Simulating backend call to get profile with ID: ${id}`);
    const mockProfile: CompanyProfile = {
      "_id": id,
      "basicInfo": { legalName: `Retrieved Company ${id}` },
      "descriptive": { tagline: "A dynamically retrieved profile." }
    } as CompanyProfile;
    return of(mockProfile);
  }

  getProfileHistory(): Observable<CompanyProfile[]> {
    console.log('Simulating backend call to get profile history.');
    const mockHistory: CompanyProfile[] = [
      { "_id": 'hist-abc', basicInfo: { legalName: 'Archived Solutions Inc.' }, descriptive: { tagline: 'Past leading tech.' } },
      { "_id": 'hist-def', basicInfo: { legalName: 'Innovate Now LLC' }, descriptive: { tagline: 'Future-focused.' } },
      { "_id": 'hist-ghi', basicInfo: { legalName: 'Global Innovations' }, descriptive: { tagline: 'Worldwide presence.' } }
    ] as CompanyProfile[];
    return of(mockHistory);
  }

  updateProfile(id: string, profile: CompanyProfile): Observable<CompanyProfile> {
    console.log(`Simulating backend call to update profile with ID: ${id}`, profile);
    // In a real app, this would send the update to a backend
    return of({ ...profile, _id: id });
  }
}
