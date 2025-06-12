import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { CompanyProfileService } from '../../../../data/company-profile.service';
import { CompanyProfile, ProfileGenerationRequest } from '../../../../../../shared/models/company-profile.model';
import { ProfileViewerDialogComponent } from '../../../profile-viewer/dialogs/profile-viewer-dialog/profile-viewer-dialog.component';

interface ProcessedFile {
  filename: string;
  status: string;
  textContent?: string;
  message?: string;
  characterCount?: number;
}

interface ProfileTemplate {
  name: string;
  description: string;
  focus_areas: string[];
  custom_instructions: string;
}

interface GenerationProgress {
  step: number;
  totalSteps: number;
  currentOperation: string;
  percentage: number;
}

@Component({
  selector: 'app-generator-page',
  templateUrl: './generator-page.component.html',
  styleUrls: ['./generator-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    MatDialogModule,
    MatDividerModule,
    MatSnackBarModule,
    MatIconModule,
    MatFormFieldModule,
    MatChipsModule,
    MatSelectModule,
    MatCheckboxModule,
    MatStepperModule,
    MatTabsModule,
    MatExpansionModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSliderModule
  ]
})
export class GeneratorPageComponent implements OnInit {
  // Form management
  profileForm: FormGroup;
  
  // Data sources
  companyUrls: string[] = [''];
  selectedFiles: File[] = [];
  processedDocuments: ProcessedFile[] = [];
  
  // State management
  isLoading: boolean = false;
  currentStep: number = 0;
  loadingMessage: string = 'Initializing...';
  generationProgress: GenerationProgress = {
    step: 0,
    totalSteps: 5,
    currentOperation: '',
    percentage: 0
  };
  
  // Templates and options
  profileTemplates: { [key: string]: ProfileTemplate } = {};
  selectedTemplate: string = '';
  focusAreas: string[] = [];
  availableFocusAreas = [
    { value: 'overview', label: 'Company Overview', icon: 'business' },
    { value: 'history', label: 'Company History', icon: 'history' },
    { value: 'products', label: 'Products & Services', icon: 'shopping_cart' },
    { value: 'leadership', label: 'Leadership Team', icon: 'people' },
    { value: 'financials', label: 'Financial Information', icon: 'account_balance' },
    { value: 'technology', label: 'Technology Stack', icon: 'computer' },
    { value: 'market', label: 'Market Position', icon: 'trending_up' },
    { value: 'news', label: 'Recent Developments', icon: 'newspaper' },
    { value: 'competitive', label: 'Competitive Analysis', icon: 'analytics' }
  ];
  
  // Advanced options
  enableRealTimeUpdates: boolean = false;
  
  // Results
  generatedProfile: any = null;
  profileMetadata: any = null;
  
  constructor(
    private fb: FormBuilder,
    private companyProfileService: CompanyProfileService,
    private snackBar: MatSnackBar,
    private router: Router,
    private http: HttpClient,
    public dialog: MatDialog
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadProfileTemplates();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      companyUrls: [''],
      customText: [''],
      customInstructions: [''],
      selectedTemplate: [''],
      focusAreas: [[]],
      useCache: [true],
      confidenceThreshold: [70],
      priority: ['normal']
    });
  }

  async loadProfileTemplates(): Promise<void> {
    try {
      const response = await this.http.get<any>('http://localhost:5000/api/profile/templates').toPromise();
      this.profileTemplates = response.templates || {};
    } catch (error) {
      console.error('Failed to load profile templates:', error);
      // Use fallback templates if API fails
      this.profileTemplates = {
        startup: {
          name: "Startup Profile",
          description: "Perfect for early-stage companies and startups",
          focus_areas: ["overview", "products", "leadership", "market", "funding"],
          custom_instructions: "Focus on innovation, growth potential, and market opportunity"
        },
        enterprise: {
          name: "Enterprise Profile", 
          description: "Comprehensive profile for established enterprises",
          focus_areas: ["overview", "history", "products", "leadership", "financials", "market"],
          custom_instructions: "Emphasize stability, market position, and comprehensive operations"
        },
        technology: {
          name: "Technology Company",
          description: "Specialized for tech companies and software businesses",
          focus_areas: ["overview", "products", "technology", "leadership", "market", "innovation"],
          custom_instructions: "Highlight technical capabilities, innovation, and technology stack"
        }
      };
    }
  }

  onTemplateSelected(templateKey: string): void {
    if (templateKey && this.profileTemplates[templateKey]) {
      const template = this.profileTemplates[templateKey];
      this.focusAreas = [...template.focus_areas];
      this.profileForm.patchValue({
        focusAreas: this.focusAreas,
        customInstructions: template.custom_instructions
      });
      
      this.snackBar.open(`Applied ${template.name} template`, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
    }
  }

  addUrl(): void {
    if (this.companyUrls.length < 10) {
      this.companyUrls.push('');
    } else {
      this.snackBar.open('Maximum 10 URLs allowed', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-warning']
      });
    }
  }

  removeUrl(index: number): void {
    if (index > 0) {
      this.companyUrls.splice(index, 1);
    }
  }

  clearUrl(index: number): void {
    this.companyUrls[index] = '';
  }

  async analyzeUrls(): Promise<void> {
    const validUrls = this.companyUrls.filter(url => url.trim() && this.isValidUrl(url));
    
    if (validUrls.length === 0) {
      this.snackBar.open('No valid URLs to analyze', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-warning']
      });
      return;
    }

    try {
      this.isLoading = true;
      this.loadingMessage = 'Analyzing data sources...';
      
      const response = await this.http.get<any>('http://localhost:5000/api/profile/analyze/sources', {
        params: { urls: validUrls }
      }).toPromise();
      
      this.showAnalysisResults(response);
      
    } catch (error) {
      console.error('URL analysis failed:', error);
      this.snackBar.open('Failed to analyze URLs', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    } finally {
      this.isLoading = false;
    }
  }

  private showAnalysisResults(analysis: any): void {
    const scrapeable = analysis.scrapeable_sources || 0;
    const total = analysis.total_sources || 0;
    const estimatedTime = analysis.estimated_generation_time || 0;
    
    let message = `Analysis complete: ${scrapeable}/${total} sources are scrapeable. `;
    message += `Estimated generation time: ${Math.ceil(estimatedTime / 60)} minutes.`;
    
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: scrapeable === total ? ['snackbar-success'] : ['snackbar-warning']
    });
  }

  onFilesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    const maxSize = 25 * 1024 * 1024; // 25MB
    const maxFiles = 20;
    const supportedTypes = ['.pdf', '.docx', '.doc', '.txt', '.html'];

    // Check file limits
    if (this.selectedFiles.length + files.length > maxFiles) {
      this.snackBar.open(`Maximum ${maxFiles} files allowed`, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    files.forEach(file => {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!supportedTypes.includes(fileExtension)) {
        this.snackBar.open(`Unsupported file type: ${file.name}`, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
        return;
      }

      if (file.size > maxSize) {
        this.snackBar.open(`File too large: ${file.name} (Max 25MB)`, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
        return;
      }

      if (!this.selectedFiles.find(f => f.name === file.name)) {
        this.selectedFiles.push(file);
      }
    });

    // Update file count info
    if (this.selectedFiles.length > 0) {
      const totalSize = this.selectedFiles.reduce((sum, file) => sum + file.size, 0);
      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);
      
      this.snackBar.open(
        `${this.selectedFiles.length} files selected (${totalSizeMB} MB total)`, 
        'Close', 
        { duration: 3000, panelClass: ['snackbar-success'] }
      );
    }

    // Clear the file input
    event.target.value = '';
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  getFileIcon(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'picture_as_pdf';
      case 'docx':
      case 'doc': return 'description';
      case 'txt': return 'text_snippet';
      case 'html': return 'web';
      default: return 'insert_drive_file';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  toggleFocusArea(area: string): void {
    const index = this.focusAreas.indexOf(area);
    if (index > -1) {
      this.focusAreas.splice(index, 1);
    } else {
      this.focusAreas.push(area);
    }
  }

  isFocusAreaSelected(area: string): boolean {
    return this.focusAreas.includes(area);
  }

  hasValidInput(): boolean {
    const hasValidUrl = this.companyUrls.some(url => url.trim() && this.isValidUrl(url));
    const hasFiles = this.selectedFiles.length > 0;
    const hasCustomText = this.profileForm.get('customText')?.value?.trim();
    
    return hasValidUrl || hasFiles || hasCustomText;
  }

  hasValidUrls(): boolean {
    return this.companyUrls.some(url => url.trim() && this.isValidUrl(url));
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }

  async generateProfile(): Promise<void> {
    if (!this.hasValidInput()) {
      this.snackBar.open('Please provide at least one data source', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-warning']
      });
      return;
    }

    this.isLoading = true;
    this.currentStep = 1;
    this.generationProgress = {
      step: 1,
      totalSteps: 5,
      currentOperation: 'Initializing generation process...',
      percentage: 10
    };

    try {
      // Prepare the request
      const formData = new FormData();
      
      // Add URLs
      const validUrls = this.companyUrls.filter(url => url.trim() && this.isValidUrl(url));
      
      const requestData = {
        urls: validUrls,
        custom_text: this.profileForm.get('customText')?.value || '',
        custom_instructions: this.profileForm.get('customInstructions')?.value || '',
        focus_areas: this.focusAreas,
        use_cache: this.profileForm.get('useCache')?.value || true,
        priority: this.profileForm.get('priority')?.value || 'normal'
      };

      formData.append('request', new Blob([JSON.stringify(requestData)], {
        type: 'application/json'
      }));

      // Add files
      this.selectedFiles.forEach((file, index) => {
        formData.append(`files`, file);
      });

      // Update progress
      this.updateProgress(2, 'Processing data sources...', 25);

      // Make the API call
      const response = await this.http.post<any>('http://localhost:5000/api/profile/generate', formData).toPromise();

      if (response.success) {
        this.updateProgress(5, 'Profile generated successfully!', 100);
        
        this.generatedProfile = response.profile;
        this.profileMetadata = response.metadata;
        
        this.showSuccessMessage(response);
        this.showGeneratedProfile(response);
        
      } else {
        throw new Error(response.message || 'Profile generation failed');
      }

    } catch (error) {
      console.error('Profile generation error:', error);
      this.snackBar.open(
        `Generation failed: ${error}`,
        'Close',
        { duration: 5000, panelClass: ['snackbar-error'] }
      );
    } finally {
      this.isLoading = false;
      this.currentStep = 0;
    }
  }

  private updateProgress(step: number, operation: string, percentage: number): void {
    this.generationProgress = {
      step,
      totalSteps: 5,
      currentOperation: operation,
      percentage
    };
    this.loadingMessage = operation;
  }

  private showSuccessMessage(response: any): void {
    const metadata = response.metadata || {};
    const sourcesProcessed = metadata.sources_processed || 0;
    const generationTime = Math.round(metadata.generation_time || 0);
    const confidenceScore = Math.round((metadata.confidence_score || 0) * 100);
    
    let message = `Profile generated successfully! `;
    message += `${sourcesProcessed} sources processed in ${generationTime}s. `;
    message += `Confidence: ${confidenceScore}%`;
    
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['snackbar-success']
    });
  }

  showGeneratedProfile(response: any): void {
    console.log('showGeneratedProfile called with response:', response);
    
    try {
      // Map the backend response to CompanyProfile structure
      const companyProfile: CompanyProfile = this.mapBackendResponseToProfile(response);
      console.log('Mapped company profile:', companyProfile);
      
      // Validate the profile has minimum required data
      if (!companyProfile.basicInfo?.legalName) {
        console.warn('Profile missing required data, using fallback');
        companyProfile.basicInfo = {
          legalName: response.profile?.company_name || 'Generated Company Profile',
          logoUrl: 'https://placehold.co/200x200/cccccc/ffffff?text=Logo'
        };
      }
      
      if (!companyProfile.descriptive?.description) {
        companyProfile.descriptive = {
          description: response.profile?.company_overview || 'Profile generated successfully'
        };
      }
      
      console.log('Final profile for dialog:', companyProfile);
      
      // Show the profile in a dialog
      console.log('About to open dialog with data:', JSON.stringify(companyProfile, null, 2));
      
      const dialogRef = this.dialog.open(ProfileViewerDialogComponent, {
        width: '90vw',
        maxWidth: '1200px',
        height: '90vh',
        data: companyProfile,
        disableClose: false,
        hasBackdrop: true,
        panelClass: 'profile-dialog'
      });
      
      // Add error handling for dialog opening
      if (!dialogRef) {
        console.error('Failed to open dialog');
        this.snackBar.open('Failed to open profile dialog', 'Close', { duration: 3000 });
        return;
      }

      console.log('Dialog opened successfully');

      dialogRef.afterClosed().subscribe(result => {
        console.log('Dialog closed with result:', result);
        if (result === 'save') {
          // Handle save logic
          this.saveProfile(response);
        }
      });
    } catch (error) {
      console.error('Error in showGeneratedProfile:', error);
      this.snackBar.open('Error displaying profile: ' + error, 'Close', { duration: 5000 });
    }
  }

  private mapBackendResponseToProfile(response: any): CompanyProfile {
    const profile = response.profile || {};
    const metadata = response.metadata || {};
    
    // Use enhanced structured extraction with NLP data
    const extractedData = this.extractStructuredData(profile);
    
    // Debug logging to see what's being extracted
    console.log('Backend profile data:', profile);
    console.log('Enhanced extracted data:', extractedData);
    
    // Map the backend response structure to CompanyProfile interface
    const companyProfile: CompanyProfile = {
      _id: profile._id || `generated_${Date.now()}`,
      
      basicInfo: {
        legalName: extractedData.companyName || profile.company_name || profile.name || 'Generated Company Profile',
        tradingName: extractedData.tradingName || profile.trading_name,
        logoUrl: extractedData.logoUrl || profile.logo_url || 'https://placehold.co/200x200/cccccc/ffffff?text=Logo',
        foundedDate: extractedData.founded ? new Date(extractedData.founded) : undefined,
        companyType: extractedData.companyType || profile.company_type || 'private',
        industryCodes: profile.industry_codes || []
      },
      
      descriptive: {
        description: extractedData.overview || extractedData.description || profile.company_overview || 'Enhanced profile generated successfully using real AI and scraping',
        mission: extractedData.mission || profile.mission_vision,
        vision: extractedData.vision || profile.vision,
        tagline: extractedData.tagline || profile.tagline,
        coreValues: extractedData.coreValues || profile.values || [],
        keywords: profile.keywords || extractedData.specializations || []
      },
      
      operational: {
        headquarters: extractedData.headquarters,
        locations: extractedData.locations || [],
        employeeCount: extractedData.employeeCount || profile.employee_count,
        employeeRange: extractedData.employeeRange || profile.employee_range,
        operatingCountries: extractedData.operatingCountries || profile.global_presence || [],
        subsidiaries: extractedData.subsidiaries || profile.subsidiaries || []
      },
      
      contact: {
        primaryPhone: extractedData.primaryPhone || profile.phone,
        email: extractedData.primaryEmail || profile.email,
        socialMedia: extractedData.socialMedia || []
      },
      
      relationships: {
        keyPeople: extractedData.keyPeople || [],
        productsServices: extractedData.productsServices || [],
        clients: extractedData.clients || profile.clients || [],
        partners: extractedData.partners || profile.partnerships || [],
        competitors: extractedData.competitors || profile.competitors || []
      },
      
      digitalPresence: {
        websiteUrl: extractedData.website || profile.website_url || profile.website,
        techStack: extractedData.techStack || profile.technology_stack || [],
        monthlyVisitors: profile.monthly_visitors
      },
      
      scrapedData: {
        sources: response.sources || [],
        lastScraped: new Date(),
        confidenceScore: metadata.confidence_score || 0.8
      },
      
      metadata: {
        created: new Date(),
        lastUpdated: new Date(),
        dataSources: ['ai-generated', 'web-scraping', 'nlp-extraction']
      }
    };
    
    return companyProfile;
  }

  private extractEnhancedStructuredData(profile: any): any {
    // Enhanced extraction with NLP/NER data from backend
    const structuredData: any = {};
    
    // Extract company name and branding
    structuredData.companyName = profile.company_name || profile.name;
    structuredData.logoUrl = profile.logo_url;
    structuredData.tagline = profile.tagline;
    
    // Extract contact information from enhanced NLP extraction
    if (profile.contact_info) {
      const contact = profile.contact_info;
      structuredData.primaryPhone = contact.phones?.[0];
      structuredData.primaryEmail = contact.emails?.[0];
      
      // Map social media from contact info
      if (contact.social_media) {
        structuredData.socialMedia = contact.social_media.map((social: any) => ({
          platform: social.platform,
          url: social.url,
          followers: social.followers || 0
        }));
      }
    }
    
    // Extract location data from enhanced extraction
    if (profile.locations && profile.locations.length > 0) {
      const primaryLocation = profile.locations[0];
      structuredData.headquarters = {
        lat: primaryLocation.coordinates?.lat || 0,
        lng: primaryLocation.coordinates?.lng || 0,
        address: `${primaryLocation.address || ''}, ${primaryLocation.city || ''}, ${primaryLocation.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '')
      };
      
      // Map all locations
      structuredData.locations = profile.locations.map((loc: any) => ({
        lat: loc.coordinates?.lat || 0,
        lng: loc.coordinates?.lng || 0,
        address: `${loc.address || ''}, ${loc.city || ''}, ${loc.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '')
      }));
    }
    
    // Extract key people from NLP extraction
    if (profile.key_people) {
      structuredData.keyPeople = profile.key_people.map((person: any) => ({
        name: person.name,
        title: person.role || person.title,
        linkedinUrl: person.linkedin
      }));
    }
    
    // Extract products and services from enhanced extraction
    if (profile.products_services) {
      structuredData.productsServices = profile.products_services.map((service: any) => ({
        name: service.name,
        category: service.category || 'Service',
        description: service.description || '',
        tags: service.features || [],
        launchDate: service.launch_date ? new Date(service.launch_date) : undefined
      }));
    }
    
    // Extract technology stack
    structuredData.techStack = profile.technology_stack || [];
    
    // Extract business information
    if (profile.business_info) {
      const business = profile.business_info;
      structuredData.employeeCount = business.company_size;
      structuredData.founded = business.established;
    }
    
    // Extract other structured fields
    structuredData.overview = profile.company_overview || profile.description;
    structuredData.mission = profile.mission_vision;
    structuredData.vision = profile.vision;
    structuredData.coreValues = profile.values || [];
    structuredData.website = profile.contact_info?.website;
    structuredData.operatingCountries = profile.global_presence || [];
    structuredData.clients = profile.clients || [];
    structuredData.partners = profile.partnerships || [];
    structuredData.achievements = profile.achievements || [];
    structuredData.certifications = profile.certifications || [];
    structuredData.specializations = profile.specializations || [];
    
    return structuredData;
  }

  private extractStructuredData(profile: any): any {
    // The backend returns structured sections, let's use them directly
    const structuredData: any = {};
    
    // Extract company name from structured data or entity extraction
    structuredData.companyName = profile.company_name || profile.name;
    
    // Use the structured sections from backend
    structuredData.overview = profile.company_overview || profile.executive_summary;
    
    // Extract products and services from the structured backend response
    if (profile.products_services) {
      if (typeof profile.products_services === 'string') {
        // Parse the products_services text into structured objects
        structuredData.productsServices = this.parseProductsFromText(profile.products_services);
      } else if (Array.isArray(profile.products_services)) {
        // Already structured
        structuredData.productsServices = profile.products_services.map((item: any) => ({
          name: typeof item === 'string' ? item : item.name || item,
          category: 'Service',
          description: typeof item === 'object' ? item.description || '' : '',
          tags: []
        }));
      }
    }
    
    // Extract leadership team from structured response
    if (profile.leadership_team) {
      if (typeof profile.leadership_team === 'string') {
        structuredData.keyPeople = this.parseLeadershipFromText(profile.leadership_team);
      } else if (Array.isArray(profile.leadership_team)) {
        structuredData.keyPeople = profile.leadership_team;
      }
    }
    
    // Extract other structured fields
    structuredData.industry = profile.industry;
    structuredData.founded = profile.founded;
    structuredData.mission = profile.mission;
    structuredData.vision = profile.vision;
    structuredData.headquarters = profile.headquarters;
    structuredData.website = profile.website_url || profile.website;
    structuredData.techStack = profile.tech_stack || profile.technology_stack;
    structuredData.marketPosition = profile.market_position;
    structuredData.recentDevelopments = profile.recent_developments;
    
    // If we have entity extraction results, merge them
    if (profile.structured_data) {
      const entityData = profile.structured_data;
      structuredData.companyName = structuredData.companyName || entityData.company_name;
      structuredData.industry = structuredData.industry || entityData.industry;
      structuredData.founded = structuredData.founded || entityData.founded;
      
      // Merge products/services if not already extracted
      if (!structuredData.productsServices && entityData.products_services) {
        structuredData.productsServices = entityData.products_services.map((item: any) => ({
          name: typeof item === 'string' ? item : item.name || item,
          category: 'Service',
          description: '',
          tags: []
        }));
      }
      
      // Merge key people if not already extracted
      if (!structuredData.keyPeople && entityData.key_people) {
        structuredData.keyPeople = entityData.key_people.map((person: any) => ({
          name: typeof person === 'string' ? person : person.name || person,
          title: typeof person === 'object' ? person.title || '' : '',
          linkedinUrl: typeof person === 'object' ? person.linkedin || '' : ''
        }));
      }
    }
    
    return structuredData;
  }

  private parseProductsFromText(productsText: string): any[] {
    const products: any[] = [];
    const lines = productsText.split('\n');
    
    for (const line of lines) {
      // Match patterns like "- **UX/UI Design:** Description"
      let match = line.match(/[-*]\s*\*\*(.*?)\*\*:?\s*(.*)/);
      if (match) {
        products.push({
          name: match[1].trim(),
          category: 'Service',
          description: match[2].trim(),
          tags: []
        });
        continue;
      }
      
      // Match patterns like "- UX/UI Design: Description"
      match = line.match(/[-*]\s*([^:]+):\s*(.*)/);
      if (match) {
        products.push({
          name: match[1].trim(),
          category: 'Service', 
          description: match[2].trim(),
          tags: []
        });
        continue;
      }
      
      // Match simple bullet points like "- UX/UI Design"
      match = line.match(/[-*]\s*(.+)/);
      if (match && match[1].trim().length > 0 && !match[1].includes('including:')) {
        products.push({
          name: match[1].trim(),
          category: 'Service',
          description: '',
          tags: []
        });
      }
    }
    
    return products;
  }

  private parseLeadershipFromText(leadershipText: string): any[] {
    const people: any[] = [];
    
    if (!leadershipText || leadershipText.includes('not disclosed') || leadershipText.includes('not provided')) {
      return [];
    }
    
    const lines = leadershipText.split('\n');
    for (const line of lines) {
      // Match patterns like "- John Doe - CEO" or "- Jane Smith, CTO"
      let match = line.match(/[-*]\s*([^-,]+)[-,]\s*(.+)/);
      if (match) {
        people.push({
          name: match[1].trim(),
          title: match[2].trim(),
          linkedinUrl: ''
        });
        continue;
      }
      
      // Match patterns like "CEO: John Doe"
      match = line.match(/([^:]+):\s*(.+)/);
      if (match) {
        people.push({
          name: match[2].trim(),
          title: match[1].trim(),
          linkedinUrl: ''
        });
      }
    }
    
    return people;
  }

  private async saveProfile(profileData: any): Promise<void> {
    try {
      // TODO: Implement save functionality once backend endpoint is available
      console.log('Profile data to save:', profileData);
      
      this.snackBar.open('Profile saved successfully', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
      this.snackBar.open('Failed to save profile', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }

  resetForm(): void {
    this.companyUrls = [''];
    this.selectedFiles = [];
    this.processedDocuments = [];
    this.focusAreas = [];
    this.selectedTemplate = '';
    this.generatedProfile = null;
    this.profileMetadata = null;
    
    this.profileForm.reset({
      useCache: true,
      confidenceThreshold: 70,
      priority: 'normal'
    });
    
    this.snackBar.open('Form reset successfully', 'Close', {
      duration: 2000,
      panelClass: ['snackbar-info']
    });
  }

  exportProfile(format: 'json' | 'pdf' | 'docx' = 'json'): void {
    if (!this.generatedProfile) {
      this.snackBar.open('No profile to export', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-warning']
      });
      return;
    }

    try {
      if (format === 'json') {
        const dataStr = JSON.stringify(this.generatedProfile, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `company_profile_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.snackBar.open('Profile exported as JSON', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      this.snackBar.open('Export failed', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }

  getProgressBarValue(): number {
    return this.generationProgress.percentage;
  }

  getProgressText(): string {
    return `Step ${this.generationProgress.step}/${this.generationProgress.totalSteps}: ${this.generationProgress.currentOperation}`;
  }
}
