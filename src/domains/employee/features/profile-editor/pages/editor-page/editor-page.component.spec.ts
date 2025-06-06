import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EditorPageComponent } from './editor-page.component';
import { EmployeeProfileService } from '../../../../data/employee-profile.service';
import { EmployeeProfile } from '../../../../../../shared/models/employee-profile.model';

describe('EditorPageComponent', () => {
  let component: EditorPageComponent;
  let fixture: ComponentFixture<EditorPageComponent>;
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
    experience: [],
    education: [],
    certifications: [],
    projects: []
  };

  beforeEach(async () => {
    const profileServiceSpy = jasmine.createSpyObj('EmployeeProfileService', [
      'getProfileById',
      'createProfile',
      'updateProfile'
    ]);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        EditorPageComponent
      ],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '123'
              }
            }
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
    profileService.createProfile.and.returnValue(of(mockProfile));
    profileService.updateProfile.and.returnValue(of(mockProfile));

    fixture = TestBed.createComponent(EditorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values in create mode', () => {
    // Reset route param to simulate create mode
    TestBed.inject(ActivatedRoute).snapshot.paramMap.get = () => null;
    fixture = TestBed.createComponent(EditorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isEditMode).toBeFalse();
    expect(component.form.get('personalInfo.firstName')?.value).toBe('');
    expect(component.form.get('personalInfo.lastName')?.value).toBe('');
    expect(component.form.get('personalInfo.email')?.value).toBe('');
  });

  it('should load profile data in edit mode', () => {
    expect(component.isEditMode).toBeTrue();
    expect(profileService.getProfileById).toHaveBeenCalledWith('123');
    expect(component.form.get('personalInfo.firstName')?.value).toBe('John');
    expect(component.form.get('personalInfo.lastName')?.value).toBe('Doe');
    expect(component.form.get('personalInfo.email')?.value).toBe('john@example.com');
  });

  it('should handle error when loading profile', () => {
    profileService.getProfileById.and.returnValue(throwError(() => new Error('Failed to load')));
    fixture = TestBed.createComponent(EditorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.error).toBe('Failed to load profile. Please try again.');
  });

  it('should validate required fields', () => {
    component.form.patchValue({
      personalInfo: {
        firstName: '',
        lastName: '',
        email: ''
      }
    });

    expect(component.form.get('personalInfo.firstName')?.errors?.['required']).toBeTruthy();
    expect(component.form.get('personalInfo.lastName')?.errors?.['required']).toBeTruthy();
    expect(component.form.get('personalInfo.email')?.errors?.['required']).toBeTruthy();
  });

  it('should validate email format', () => {
    component.form.patchValue({
      personalInfo: {
        email: 'invalid-email'
      }
    });

    expect(component.form.get('personalInfo.email')?.errors?.['email']).toBeTruthy();
  });

  it('should add and remove technical skills', () => {
    component.addTechnicalSkill();
    expect(component.technicalSkills.length).toBe(2); // One from mock + one added

    component.removeTechnicalSkill(0);
    expect(component.technicalSkills.length).toBe(1);
  });

  it('should add and remove soft skills', () => {
    component.addSoftSkill();
    expect(component.softSkills.length).toBe(1);

    component.removeSoftSkill(0);
    expect(component.softSkills.length).toBe(0);
  });

  it('should add and remove languages', () => {
    component.addLanguage();
    expect(component.languages.length).toBe(1);

    component.removeLanguage(0);
    expect(component.languages.length).toBe(0);
  });

  it('should create new profile when form is submitted in create mode', () => {
    // Reset route param to simulate create mode
    TestBed.inject(ActivatedRoute).snapshot.paramMap.get = () => null;
    fixture = TestBed.createComponent(EditorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.patchValue({
      personalInfo: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com'
      }
    });

    component.onSubmit();

    expect(profileService.createProfile).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Profile saved successfully',
      'Close',
      jasmine.any(Object)
    );
  });

  it('should update existing profile when form is submitted in edit mode', () => {
    component.form.patchValue({
      personalInfo: {
        firstName: 'John Updated',
        lastName: 'Doe Updated',
        email: 'john.updated@example.com'
      }
    });

    component.onSubmit();

    expect(profileService.updateProfile).toHaveBeenCalledWith('123', jasmine.any(Object));
    expect(snackBar.open).toHaveBeenCalledWith(
      'Profile saved successfully',
      'Close',
      jasmine.any(Object)
    );
  });

  it('should handle error when saving profile', () => {
    profileService.updateProfile.and.returnValue(throwError(() => new Error('Failed to save')));

    component.onSubmit();

    expect(snackBar.open).toHaveBeenCalledWith(
      'Failed to save profile. Please try again.',
      'Close',
      jasmine.any(Object)
    );
  });

  it('should navigate back when cancel is clicked', () => {
    spyOn(router, 'navigate');
    component.cancel();
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should mark all fields as touched when submitting invalid form', () => {
    component.form.patchValue({
      personalInfo: {
        firstName: '',
        lastName: '',
        email: ''
      }
    });

    component.onSubmit();

    expect(component.form.get('personalInfo.firstName')?.touched).toBeTrue();
    expect(component.form.get('personalInfo.lastName')?.touched).toBeTrue();
    expect(component.form.get('personalInfo.email')?.touched).toBeTrue();
  });
}); 