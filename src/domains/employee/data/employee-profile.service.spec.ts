import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmployeeProfileService } from './employee-profile.service';
import { EmployeeProfile } from '../../../shared/models/employee-profile.model';

describe('EmployeeProfileService', () => {
  let service: EmployeeProfileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmployeeProfileService]
    });

    service = TestBed.inject(EmployeeProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProfiles', () => {
    it('should return an array of employee profiles', () => {
      const mockProfiles: EmployeeProfile[] = [
        {
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
        }
      ];

      service.getProfiles().subscribe(profiles => {
        expect(profiles).toEqual(mockProfiles);
      });

      const req = httpMock.expectOne('/api/employees');
      expect(req.request.method).toBe('GET');
      req.flush(mockProfiles);
    });
  });

  describe('getProfileById', () => {
    it('should return a single employee profile', () => {
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

      service.getProfileById('123').subscribe(profile => {
        expect(profile).toEqual(mockProfile);
      });

      const req = httpMock.expectOne('/api/employees/123');
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });
  });

  describe('createProfile', () => {
    it('should create a new employee profile', () => {
      const newProfile: EmployeeProfile = {
        personalInfo: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com'
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

      service.createProfile(newProfile).subscribe(profile => {
        expect(profile).toEqual({ ...newProfile, _id: '123' });
      });

      const req = httpMock.expectOne('/api/employees');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProfile);
      req.flush({ ...newProfile, _id: '123' });
    });
  });

  describe('updateProfile', () => {
    it('should update an existing employee profile', () => {
      const updatedProfile: EmployeeProfile = {
        _id: '123',
        personalInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com'
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

      service.updateProfile('123', updatedProfile).subscribe(profile => {
        expect(profile).toEqual(updatedProfile);
      });

      const req = httpMock.expectOne('/api/employees/123');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedProfile);
      req.flush(updatedProfile);
    });
  });

  describe('deleteProfile', () => {
    it('should delete an employee profile', () => {
      service.deleteProfile('123').subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne('/api/employees/123');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('searchProfiles', () => {
    it('should search for profiles with query parameters', () => {
      const mockProfiles: EmployeeProfile[] = [
        {
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
        }
      ];

      service.searchProfiles('developer').subscribe(profiles => {
        expect(profiles).toEqual(mockProfiles);
      });

      const req = httpMock.expectOne('/api/employees/search?q=developer');
      expect(req.request.method).toBe('GET');
      req.flush(mockProfiles);
    });
  });

  describe('filterBySkills', () => {
    it('should filter profiles by skills', () => {
      const mockProfiles: EmployeeProfile[] = [
        {
          personalInfo: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
          },
          skills: {
            technical: [
              {
                name: 'JavaScript',
                level: 4,
                yearsOfExperience: 5
              }
            ],
            soft: [],
            languages: []
          },
          experience: [],
          education: [],
          certifications: [],
          projects: []
        }
      ];

      service.filterBySkills(['JavaScript', 'TypeScript']).subscribe(profiles => {
        expect(profiles).toEqual(mockProfiles);
      });

      const req = httpMock.expectOne('/api/employees/filter/skills');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ skills: ['JavaScript', 'TypeScript'] });
      req.flush(mockProfiles);
    });
  });
}); 