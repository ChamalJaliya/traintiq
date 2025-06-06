import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewerPageComponent } from './viewer-page.component';
import { EmployeeProfileService } from '../../../../data/employee-profile.service';
import { EmployeeProfile } from '../../../../../../shared/models/employee-profile.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ViewerPageComponent', () => {
  let component: ViewerPageComponent;
  let fixture: ComponentFixture<ViewerPageComponent>;
  let profileService: jasmine.SpyObj<EmployeeProfileService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: Router;

  const mockProfile: EmployeeProfile = {
    _id: '123',
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
          yearsOfExperience: 5,
          lastUsed: new Date()
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
  };

  beforeEach(async () => {
    const profileServiceSpy = jasmine.createSpyObj('EmployeeProfileService', ['getProfileById', 'getProfiles']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NoopAnimationsModule,
        ViewerPageComponent
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: new BehaviorSubject({
              get: () => '123'
            })
          }
        },
        { provide: EmployeeProfileService, useValue: profileServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    profileService = TestBed.inject(EmployeeProfileService) as jasmine.SpyObj<EmployeeProfileService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    profileService.getProfileById.and.returnValue(of(mockProfile));
    profileService.getProfiles.and.returnValue(of([mockProfile]));

    fixture = TestBed.createComponent(ViewerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile on init', () => {
    expect(profileService.getProfileById).toHaveBeenCalledWith('123');
  });

  it('should display profile information', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('John Doe');
    expect(compiled.textContent).toContain('john@example.com');
  });

  it('should display technical skills', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('JavaScript');
    expect(compiled.textContent).toContain('Level: 4');
  });

  it('should display work experience', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Tech Corp');
    expect(compiled.textContent).toContain('Senior Developer');
  });

  it('should handle error when loading profile', () => {
    profileService.getProfileById.and.returnValue(throwError(() => new Error('Failed to load')));
    component.loadProfile();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Failed to load profile');
  });

  it('should retry loading profile when retry button is clicked', () => {
    const retryButton = fixture.nativeElement.querySelector('button[color="primary"]');
    retryButton.click();
    fixture.detectChanges();

    expect(profileService.getProfileById).toHaveBeenCalledTimes(2);
  });

  it('should format skill tooltip correctly', () => {
    const skill = mockProfile.skills.technical[0];
    const tooltip = component.getSkillTooltip(skill);
    expect(tooltip).toContain('Experience: 5 years');
    expect(tooltip).toContain('Last used:');
  });

  it('should download profile as JSON', () => {
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob-url');
    spyOn(window.URL, 'revokeObjectURL');
    spyOn(document, 'createElement').and.callThrough();
    spyOn(document.body, 'appendChild');
    spyOn(document.body, 'removeChild');

    component.downloadProfile(mockProfile);

    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob-url');
  });
}); 