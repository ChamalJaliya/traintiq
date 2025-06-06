import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { EmployeeProfile } from '../../../shared/models/employee-profile.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeProfileService {
  private apiUrl = '/api/employees';
  private mockProfiles: EmployeeProfile[] = [
    {
      _id: '1',
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        linkedIn: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe'
      },
      skills: {
        technical: [
          {
            name: 'JavaScript',
            level: 5,
            yearsOfExperience: 8,
            lastUsed: new Date('2024-03-15'),
            projects: ['Modern Web App', 'E-commerce Platform']
          },
          {
            name: 'TypeScript',
            level: 4,
            yearsOfExperience: 5,
            lastUsed: new Date('2024-03-15'),
            projects: ['Angular Dashboard']
          },
          {
            name: 'Angular',
            level: 4,
            yearsOfExperience: 4,
            lastUsed: new Date('2024-03-15'),
            projects: ['Enterprise Portal']
          }
        ],
        soft: [
          {
            name: 'Team Leadership',
            level: 4,
            yearsOfExperience: 3
          },
          {
            name: 'Project Management',
            level: 4,
            yearsOfExperience: 5
          }
        ],
        languages: [
          {
            name: 'English',
            level: 'Native'
          },
          {
            name: 'Spanish',
            level: 'Intermediate'
          }
        ]
      },
      experience: [
        {
          company: 'Tech Solutions Inc.',
          title: 'Senior Frontend Developer',
          location: 'New York, NY',
          startDate: new Date('2020-01-01'),
          current: true,
          description: 'Leading the frontend development team in building enterprise-scale applications.',
          highlights: [
            'Implemented micro-frontend architecture',
            'Reduced build time by 40%',
            'Mentored junior developers'
          ],
          technologies: ['Angular', 'TypeScript', 'RxJS', 'NgRx'],
          responsibilities: [
            'Architecture design',
            'Code reviews',
            'Team leadership'
          ]
        },
        {
          company: 'Digital Innovations LLC',
          title: 'Frontend Developer',
          location: 'Boston, MA',
          startDate: new Date('2017-03-01'),
          endDate: new Date('2019-12-31'),
          current: false,
          description: 'Developed responsive web applications using modern JavaScript frameworks.',
          highlights: [
            'Built reusable component library',
            'Improved application performance'
          ],
          technologies: ['React', 'JavaScript', 'Redux'],
          responsibilities: [
            'Feature development',
            'Performance optimization'
          ]
        }
      ],
      education: [
        {
          institution: 'MIT',
          degree: 'Master of Science',
          field: 'Computer Science',
          startDate: new Date('2015-09-01'),
          endDate: new Date('2017-05-31'),
          current: false,
          grade: '3.8 GPA',
          achievements: [
            'Published research paper on web performance optimization',
            'Teaching Assistant for Web Development course'
          ]
        },
        {
          institution: 'Boston University',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: new Date('2011-09-01'),
          endDate: new Date('2015-05-31'),
          current: false,
          grade: '3.7 GPA',
          achievements: [
            'Dean\'s List all semesters',
            'Computer Science Club President'
          ]
        }
      ],
      certifications: [
        {
          name: 'Angular Certified Developer',
          issuingOrganization: 'Google',
          issueDate: new Date('2023-01-15'),
          credentialId: 'ANG-2023-1234',
          credentialUrl: 'https://example.com/cert/1234'
        },
        {
          name: 'AWS Certified Developer',
          issuingOrganization: 'Amazon',
          issueDate: new Date('2022-06-01'),
          credentialId: 'AWS-2022-5678',
          credentialUrl: 'https://example.com/cert/5678'
        }
      ],
      projects: [
        {
          name: 'Enterprise Portal',
          description: 'Led the development of a large-scale enterprise portal using Angular.',
          role: 'Tech Lead',
          startDate: new Date('2022-01-01'),
          endDate: new Date('2023-12-31'),
          technologies: ['Angular', 'TypeScript', 'NgRx', 'Material UI'],
          highlights: [
            'Implemented micro-frontend architecture',
            'Integrated with multiple backend services',
            'Improved performance by 50%'
          ]
        },
        {
          name: 'E-commerce Platform',
          description: 'Developed a modern e-commerce platform with real-time inventory management.',
          role: 'Senior Developer',
          startDate: new Date('2021-01-01'),
          endDate: new Date('2021-12-31'),
          technologies: ['React', 'Node.js', 'MongoDB'],
          highlights: [
            'Implemented real-time inventory tracking',
            'Integrated payment gateway',
            'Built responsive UI'
          ],
          url: 'https://example-ecommerce.com'
        }
      ],
      metadata: {
        created: new Date('2023-01-01'),
        lastUpdated: new Date('2024-03-15'),
        source: 'MANUAL'
      }
    }
  ];

  constructor(private http: HttpClient) {}

  getProfiles(): Observable<EmployeeProfile[]> {
    return of(this.mockProfiles).pipe(delay(500));
  }

  getProfileById(id: string): Observable<EmployeeProfile> {
    const profile = this.mockProfiles.find(p => p._id === id);
    return of(profile || this.mockProfiles[0]).pipe(delay(500));
  }

  createProfile(profile: EmployeeProfile): Observable<EmployeeProfile> {
    const newProfile = {
      ...profile,
      _id: Math.random().toString(36).substr(2, 9),
      metadata: {
        created: new Date(),
        lastUpdated: new Date(),
        source: 'MANUAL' as const
      }
    };
    this.mockProfiles.push(newProfile);
    return of(newProfile).pipe(delay(500));
  }

  updateProfile(id: string, profile: EmployeeProfile): Observable<EmployeeProfile> {
    const index = this.mockProfiles.findIndex(p => p._id === id);
    if (index !== -1) {
      this.mockProfiles[index] = {
        ...profile,
        metadata: {
          ...profile.metadata,
          lastUpdated: new Date()
        }
      };
      return of(this.mockProfiles[index]).pipe(delay(500));
    }
    return of(profile).pipe(delay(500));
  }

  deleteProfile(id: string): Observable<void> {
    const index = this.mockProfiles.findIndex(p => p._id === id);
    if (index !== -1) {
      this.mockProfiles.splice(index, 1);
    }
    return of(void 0).pipe(delay(500));
  }

  searchProfiles(query: string): Observable<EmployeeProfile[]> {
    const lowercaseQuery = query.toLowerCase();
    const filteredProfiles = this.mockProfiles.filter(profile => 
      profile.personalInfo.firstName.toLowerCase().includes(lowercaseQuery) ||
      profile.personalInfo.lastName.toLowerCase().includes(lowercaseQuery) ||
      profile.experience.some(exp => 
        exp.title.toLowerCase().includes(lowercaseQuery) ||
        exp.company.toLowerCase().includes(lowercaseQuery)
      ) ||
      profile.skills.technical.some(skill => 
        skill.name.toLowerCase().includes(lowercaseQuery)
      )
    );
    return of(filteredProfiles).pipe(delay(500));
  }

  filterBySkills(skills: string[]): Observable<EmployeeProfile[]> {
    const lowercaseSkills = skills.map(s => s.toLowerCase());
    const filteredProfiles = this.mockProfiles.filter(profile =>
      profile.skills.technical.some(skill =>
        lowercaseSkills.includes(skill.name.toLowerCase())
      )
    );
    return of(filteredProfiles).pipe(delay(500));
  }
} 