import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { PoolPageComponent } from './pool-page.component';
import { EmployeeProfileService } from '../../../../data/employee-profile.service';
import { EmployeeProfile } from '../../../../../../shared/models/employee-profile.model';

describe('PoolPageComponent', () => {
  let component: PoolPageComponent;
  let fixture: ComponentFixture<PoolPageComponent>;
  let profileService: jasmine.SpyObj<EmployeeProfileService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockProfiles: EmployeeProfile[] = [
    {
      _id: '1',
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
          },
          {
            name: 'TypeScript',
            level: 3,
            yearsOfExperience: 2
          }
        ],
        soft: [],
        languages: []
      },
      experience: [
        {
          company: 'Tech Corp',
          title: 'Senior Developer',
          startDate: new Date(),
          current: true,
          description: 'Full stack development',
          highlights: [],
          technologies: ['JavaScript', 'Angular'],
          responsibilities: []
        }
      ],
      education: [],
      certifications: [],
      projects: []
    },
    {
      _id: '2',
      personalInfo: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com'
      },
      skills: {
        technical: [
          {
            name: 'Python',
            level: 5,
            yearsOfExperience: 7
          }
        ],
        soft: [],
        languages: []
      },
      experience: [
        {
          company: 'Data Corp',
          title: 'Data Scientist',
          startDate: new Date(),
          current: true,
          description: 'Machine learning',
          highlights: [],
          technologies: ['Python', 'TensorFlow'],
          responsibilities: []
        }
      ],
      education: [],
      certifications: [],
      projects: []
    }
  ];

  beforeEach(async () => {
    const profileServiceSpy = jasmine.createSpyObj('EmployeeProfileService', [
      'getProfiles',
      'deleteProfile'
    ]);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        PoolPageComponent
      ],
      providers: [
        FormBuilder,
        { provide: EmployeeProfileService, useValue: profileServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    profileService = TestBed.inject(EmployeeProfileService) as jasmine.SpyObj<EmployeeProfileService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  beforeEach(() => {
    profileService.getProfiles.and.returnValue(of(mockProfiles));
    profileService.deleteProfile.and.returnValue(of(void 0));

    fixture = TestBed.createComponent(PoolPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profiles on init', () => {
    expect(profileService.getProfiles).toHaveBeenCalled();
    expect(component.totalProfiles).toBe(2);
  });

  it('should handle error when loading profiles', () => {
    profileService.getProfiles.and.returnValue(throwError(() => new Error('Failed to load')));
    component.loadProfiles();
    fixture.detectChanges();

    expect(component.error).toBe('Failed to load profiles. Please try again.');
  });

  it('should filter profiles by search term', fakeAsync(() => {
    component.filterForm.get('search')?.setValue('John');
    tick(300); // Debounce time

    fixture.detectChanges();
    component.filteredProfiles$.subscribe(profiles => {
      expect(profiles.length).toBe(1);
      expect(profiles[0].personalInfo.firstName).toBe('John');
    });
  }));

  it('should filter profiles by skill', () => {
    component.addSkill({ value: 'JavaScript', input: { value: '' } });
    fixture.detectChanges();

    component.filteredProfiles$.subscribe(profiles => {
      expect(profiles.length).toBe(1);
      expect(profiles[0].personalInfo.firstName).toBe('John');
    });
  });

  it('should filter profiles by experience level', () => {
    component.filterForm.get('experienceLevel')?.setValue('senior');
    fixture.detectChanges();

    component.filteredProfiles$.subscribe(profiles => {
      expect(profiles.length).toBe(1);
      expect(profiles[0].personalInfo.firstName).toBe('Jane');
    });
  });

  it('should add and remove skills from filter', () => {
    component.addSkill({ value: 'JavaScript', input: { value: '' } });
    expect(component.selectedSkills).toContain('JavaScript');

    component.removeSkill('JavaScript');
    expect(component.selectedSkills).not.toContain('JavaScript');
  });

  it('should get top skills for profile', () => {
    const topSkills = component.getTopSkills(mockProfiles[0]);
    expect(topSkills.length).toBe(2);
    expect(topSkills[0].name).toBe('JavaScript');
    expect(topSkills[1].name).toBe('TypeScript');
  });

  it('should delete profile after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteProfile(mockProfiles[0]);

    expect(profileService.deleteProfile).toHaveBeenCalledWith('1');
    expect(snackBar.open).toHaveBeenCalledWith(
      'Profile deleted successfully',
      'Close',
      jasmine.any(Object)
    );
  });

  it('should not delete profile without confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteProfile(mockProfiles[0]);

    expect(profileService.deleteProfile).not.toHaveBeenCalled();
  });

  it('should handle error when deleting profile', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    profileService.deleteProfile.and.returnValue(throwError(() => new Error('Failed to delete')));

    component.deleteProfile(mockProfiles[0]);

    expect(snackBar.open).toHaveBeenCalledWith(
      'Failed to delete profile',
      'Close',
      jasmine.any(Object)
    );
  });

  it('should retry loading profiles', () => {
    spyOn(component, 'loadProfiles');
    component.retry();
    expect(component.loadProfiles).toHaveBeenCalled();
  });

  describe('Profile filtering', () => {
    it('should match search term in name', () => {
      component.filterForm.get('search')?.setValue('doe');
      fixture.detectChanges();

      component.filteredProfiles$.subscribe(profiles => {
        expect(profiles.length).toBe(1);
        expect(profiles[0].personalInfo.lastName).toBe('Doe');
      });
    });

    it('should match search term in skills', () => {
      component.filterForm.get('search')?.setValue('python');
      fixture.detectChanges();

      component.filteredProfiles$.subscribe(profiles => {
        expect(profiles.length).toBe(1);
        expect(profiles[0].personalInfo.firstName).toBe('Jane');
      });
    });

    it('should match search term in company', () => {
      component.filterForm.get('search')?.setValue('data corp');
      fixture.detectChanges();

      component.filteredProfiles$.subscribe(profiles => {
        expect(profiles.length).toBe(1);
        expect(profiles[0].personalInfo.firstName).toBe('Jane');
      });
    });

    it('should combine multiple filters', () => {
      component.filterForm.get('search')?.setValue('developer');
      component.addSkill({ value: 'JavaScript', input: { value: '' } });
      component.filterForm.get('experienceLevel')?.setValue('mid');
      fixture.detectChanges();

      component.filteredProfiles$.subscribe(profiles => {
        expect(profiles.length).toBe(1);
        expect(profiles[0].personalInfo.firstName).toBe('John');
      });
    });
  });
}); 