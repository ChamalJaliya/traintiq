import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { CVAnalysis, EmployeeProfile } from '../../../shared/models/employee-profile.model';

@Injectable({
  providedIn: 'root'
})
export class CVAnalysisService {
  private apiUrl = '/api/cv-analysis';
  private mockAnalyses: CVAnalysis[] = [
    {
      profileId: '1',
      analyzedDate: new Date('2024-03-15'),
      parsedData: {
        confidence: 0.92,
        extractedSkills: [
          {
            name: 'JavaScript',
            category: 'technical',
            confidence: 0.95,
            context: 'Extensive experience in JavaScript development',
            frequency: 12
          },
          {
            name: 'TypeScript',
            category: 'technical',
            confidence: 0.90,
            context: 'TypeScript development in Angular projects',
            frequency: 8
          },
          {
            name: 'Angular',
            category: 'technical',
            confidence: 0.93,
            context: 'Angular framework expertise',
            frequency: 10
          },
          {
            name: 'Team Leadership',
            category: 'soft',
            confidence: 0.85,
            context: 'Led development teams',
            frequency: 4
          }
        ],
        experienceYears: 8,
        educationLevel: 'Master\'s Degree',
        keyHighlights: [
          'Senior Frontend Developer with 8+ years of experience',
          'Strong expertise in Angular and TypeScript',
          'Team leadership experience',
          'Master\'s degree in Computer Science'
        ]
      },
      matchingScores: {
        technicalFit: 0.88,
        experienceFit: 0.92,
        educationFit: 0.95,
        overallScore: 0.90
      },
      recommendations: [
        'Excellent fit for senior frontend developer positions',
        'Consider for technical team lead roles',
        'Strong candidate for Angular-based projects'
      ]
    }
  ];

  constructor(private http: HttpClient) {}

  analyzeCV(file: File): Observable<CVAnalysis> {
    // Simulate file analysis with mock data
    const mockAnalysis: CVAnalysis = {
      profileId: Math.random().toString(36).substr(2, 9),
      analyzedDate: new Date(),
      parsedData: {
        confidence: 0.85,
        extractedSkills: [
          {
            name: 'JavaScript',
            category: 'technical',
            confidence: 0.9,
            context: 'JavaScript development experience',
            frequency: 8
          },
          {
            name: 'Angular',
            category: 'technical',
            confidence: 0.85,
            context: 'Angular framework experience',
            frequency: 6
          }
        ],
        experienceYears: 5,
        educationLevel: 'Bachelor\'s Degree',
        keyHighlights: [
          'Frontend Developer with 5+ years of experience',
          'Angular and JavaScript expertise'
        ]
      },
      matchingScores: {
        technicalFit: 0.85,
        experienceFit: 0.80,
        educationFit: 0.90,
        overallScore: 0.85
      },
      recommendations: [
        'Good fit for frontend developer positions',
        'Consider for Angular-based projects'
      ]
    };

    this.mockAnalyses.push(mockAnalysis);
    return of(mockAnalysis).pipe(delay(1000));
  }

  generateProfile(analysis: CVAnalysis): Observable<EmployeeProfile> {
    const mockProfile: EmployeeProfile = {
      personalInfo: {
        firstName: 'Generated',
        lastName: 'Profile',
        email: 'generated@example.com'
      },
      skills: {
        technical: analysis.parsedData.extractedSkills
          .filter(skill => skill.category === 'technical')
          .map(skill => ({
            name: skill.name,
            level: Math.round(skill.confidence * 5),
            yearsOfExperience: Math.round(analysis.parsedData.experienceYears * skill.confidence)
          })),
        soft: analysis.parsedData.extractedSkills
          .filter(skill => skill.category === 'soft')
          .map(skill => ({
            name: skill.name,
            level: Math.round(skill.confidence * 5),
            yearsOfExperience: Math.round(analysis.parsedData.experienceYears * skill.confidence)
          })),
        languages: []
      },
      experience: [],
      education: [],
      certifications: [],
      projects: [],
      metadata: {
        created: new Date(),
        lastUpdated: new Date(),
        source: 'CV_UPLOAD'
      }
    };

    return of(mockProfile).pipe(delay(800));
  }

  getAnalysisHistory(): Observable<CVAnalysis[]> {
    return of(this.mockAnalyses).pipe(delay(500));
  }

  getAnalysisById(id: string): Observable<CVAnalysis> {
    const analysis = this.mockAnalyses.find(a => a.profileId === id);
    return of(analysis || this.mockAnalyses[0]).pipe(delay(500));
  }

  compareWithJobDescription(analysisId: string, jobDescription: string): Observable<{
    matchScore: number;
    missingSkills: string[];
    recommendations: string[];
  }> {
    // Simulate job description comparison
    return of({
      matchScore: 0.85,
      missingSkills: ['Docker', 'Kubernetes'],
      recommendations: [
        'Consider learning containerization technologies',
        'Good match for the position overall'
      ]
    }).pipe(delay(800));
  }

  extractSkills(text: string): Observable<string[]> {
    // Simulate skill extraction from text
    const commonSkills = ['JavaScript', 'TypeScript', 'Angular', 'React', 'Node.js'];
    const extractedSkills = commonSkills.filter(() => Math.random() > 0.5);
    return of(extractedSkills).pipe(delay(500));
  }
} 