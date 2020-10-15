import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewTeamReportPage } from './view-team-report.page';

describe('ViewTeamReportPage', () => {
  let component: ViewTeamReportPage;
  let fixture: ComponentFixture<ViewTeamReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTeamReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewTeamReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
