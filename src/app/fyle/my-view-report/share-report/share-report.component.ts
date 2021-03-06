import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-share-report',
  templateUrl: './share-report.component.html',
  styleUrls: ['./share-report.component.scss'],
})
export class ShareReportComponent implements OnInit {
  email = '';
  emailValidation = false;

  constructor(
    private popoverController: PopoverController
  ) { }

  async cancel() {
    await this.popoverController.dismiss();
  }

  shareReport(emailInput) {
    this.emailValidation = false;
    if (!(emailInput.value.trim().length > 0)) {
      this.emailValidation = true;
      return;
    }

    if (emailInput.valid) {
      this.popoverController.dismiss({
        email: this.email
      });
    } else {
      emailInput.control.markAllAsTouched();
    }
  }

  ngOnInit() { }
}
