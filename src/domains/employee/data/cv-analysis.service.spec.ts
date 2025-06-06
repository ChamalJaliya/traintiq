import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CVAnalysisService } from './cv-analysis.service';
import { CVAnalysis, EmployeeProfile } from '../../../shared/models/employee-profile.model';

describe('CVAnalysisService', () => {
  let service: CVAnalysisService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CVAnalysisService]
    });

    service = TestBed.inject(CVAnalysisService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('analyzeCV', () => {
    it('should analyze a CV file and return analysis results', () => {
      const mockFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      const mockAnalysis: CVAnalysis = {
        profileId: '123',
        analyzedDate: new Date(),
        parsedData: {
          confidence: 0.85,
          extractedSkills: [
            {
              name: 'JavaScript',
              category: 'technical',
              confidence: 0.9,
              context: 'Used JavaScript for web development',
              frequency: 5
            }
          ],
          experienceYears: 5,
          educationLevel: 'Bachelor',
          keyHighlights: ['Full Stack Developer', '5 years experience']
        },
        matchingScores: {
          technicalFit: 0.8,
          experienceFit: 0.7,
          educationFit: 0.9,
          overallScore: 0.8
        },
        recommendations: ['Consider for senior developer position']
      };

      service.analyzeCV(mockFile).subscribe(analysis => {
        expect(analysis).toEqual(mockAnalysis);
      });

      const req = httpMock.expectOne('/api/cv-analysis/analyze');
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTruthy();
      req.flush(mockAnalysis);
    });
  });

  describe('generateProfile', () => {
    it('should generate an employee profile from CV analysis', () => {
      const mockAnalysis: CVAnalysis = {
        profileId: '123',
        analyzedDate: new Date(),
        parsedData: {
          confidence: 0.85,
          extractedSkills: [],
          experienceYears: 5,
          educationLevel: 'Bachelor',
          keyHighlights: []
        },
        matchingScores: {
          technicalFit: 0.8,
          experienceFit: 0.7,
          educationFit: 0.9,
          overallScore: 0.8
        },
        recommendations: []
      };

      const mockProfile: EmployeeProfile = {
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        },
        skills: {
          technical: [],
          soft: [],
          languages: []
        },
        experience: [],
        education: [],
        certifications: [],
        projects: []
      };

      service.generateProfile(mockAnalysis).subscribe(profile => {
        expect(profile).toEqual(mockProfile);
      });

      const req = httpMock.expectOne('/api/cv-analysis/generate-profile');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockAnalysis);
      req.flush(mockProfile);
    });
  });

  describe('getAnalysisHistory', () => {
    it('should return analysis history', () => {
      const mockHistory: CVAnalysis[] = [
        {
          profileId: '123',
          analyzedDate: new Date(),
          parsedData: {
            confidence: 0.85,
            extractedSkills: [],
            experienceYears: 5,
            educationLevel: 'Bachelor',
            keyHighlights: []
          },
          matchingScores: {
            technicalFit: 0.8,
            experienceFit: 0.7,
            educationFit: 0.9,
            overallScore: 0.8
          },
          recommendations: []
        }
      ];

      service.getAnalysisHistory().subscribe(history => {
        expect(history).toEqual(mockHistory);
      });

      const req = httpMock.expectOne('/api/cv-analysis/history');
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });
  });

  describe('getAnalysisById', () => {
    it('should return a single analysis by ID', () => {
      const mockAnalysis: CVAnalysis = {
        profileId: '123',
        analyzedDate: new Date(),
        parsedData: {
          confidence: 0.85,
          extractedSkills: [],
          experienceYears: 5,
          educationLevel: 'Bachelor',
          keyHighlights: []
        },
        matchingScores: {
          technicalFit: 0.8,
          experienceFit: 0.7,
          educationFit: 0.9,
          overallScore: 0.8
        },
        recommendations: []
      };

      service.getAnalysisById('123').subscribe(analysis => {
        expect(analysis).toEqual(mockAnalysis);
      });

      const req = httpMock.expectOne('/api/cv-analysis/123');
      expect(req.request.method).toBe('GET');
      req.flush(mockAnalysis);
    });
  });

  describe('compareWithJobDescription', () => {
    it('should compare analysis with job description', () => {
      const mockResult = {
        matchScore: 0.85,
        missingSkills: ['Python', 'Docker'],
        recommendations: ['Consider upskilling in Python']
      };

      service.compareWithJobDescription('123', 'Senior Developer position').subscribe(result => {
        expect(result).toEqual(mockResult);
      });

      const req = httpMock.expectOne('/api/cv-analysis/123/compare');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ jobDescription: 'Senior Developer position' });
      req.flush(mockResult);
    });
  });

  describe('extractSkills', () => {
    it('should extract skills from text', () => {
      const mockSkills = ['JavaScript', 'TypeScript', 'Angular'];

      service.extractSkills('Frontend developer with JavaScript experience').subscribe(skills => {
        expect(skills).toEqual(mockSkills);
      });

      const req = httpMock.expectOne('/api/cv-analysis/extract-skills');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ text: 'Frontend developer with JavaScript experience' });
      req.flush(mockSkills);
    });
  });
}); 