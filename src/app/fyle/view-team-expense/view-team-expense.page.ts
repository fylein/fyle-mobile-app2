import { Component, OnInit } from '@angular/core';
import { Observable, from, forkJoin } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ActivatedRoute } from '@angular/router';
import { PolicyService } from 'src/app/core/services/policy.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { switchMap, shareReplay, concatMap, map, finalize } from 'rxjs/operators';
import { StatusService } from 'src/app/core/services/status.service';

@Component({
  selector: 'app-view-team-expense',
  templateUrl: './view-team-expense.page.html',
  styleUrls: ['./view-team-expense.page.scss'],
})
export class ViewTeamExpensePage implements OnInit {

  etxn$: Observable<Expense>;
  policyViloations$: Observable<any>;
  isAmountCapped$: Observable<boolean>;
  isCriticalPolicyViolated$: Observable<boolean>;
  allExpenseCustomFields$: Observable<any>;
  customProperties$: Observable<any>;
  etxnWithoutCustomProperties$: Observable<any>;
  orgSettings: any;

  currencyOptions;

  constructor(
    private loaderService: LoaderService,
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute,
    private policyService: PolicyService,
    private offlineService: OfflineService,
    private customInputsService: CustomInputsService,
    private statusService: StatusService
  ) { }

  isNumber(val) {
    return typeof val === 'number';
  }

  isPolicyComment(estatus) {
    return estatus.st.org_user_id === 'POLICY';
  }

  scrollToComments() {
    document.getElementById('commentsSection').scrollIntoView();
  }

  getDisplayValue(customProperties) {
    return this.customInputsService.getCustomPropertyDisplayValue(customProperties);
  }

  ngOnInit() {
    const txId = this.activatedRoute.snapshot.params.id;
    this.currencyOptions = {
      disabled: true
    };

    this.etxnWithoutCustomProperties$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return this.transactionService.getEtxn(txId);
      }),
      shareReplay()
    );

    this.customProperties$ = this.etxnWithoutCustomProperties$.pipe(
      concatMap(etxn => {
        return this.customInputsService.fillCustomProperties(etxn.tx_org_category_id, etxn.tx_custom_properties, true);
      }),
      shareReplay()
    );

    this.etxn$ = forkJoin(
      [
        this.etxnWithoutCustomProperties$,
        this.customProperties$
      ]).pipe(
      map(res => {
        res[0].tx_custom_properties = res[1];
        return res[0];
      }),
      finalize(() => this.loaderService.hideLoader())
    );

    this.policyViloations$ = this.etxnWithoutCustomProperties$.pipe(
      concatMap(etxn => {
        return this.statusService.find('transactions', etxn.tx_id);
      }),
      map(comments => {
        return comments.filter(this.isPolicyComment);
      })
    );

    this.isAmountCapped$ = this.etxn$.pipe(
      map(etxn => this.isNumber(etxn.tx_admin_amount) || this.isNumber(etxn.tx_policy_amount))
    );

    const orgSettings$ = this.offlineService.getOrgSettings();

    orgSettings$.subscribe(orgSettings => {
      this.orgSettings = orgSettings;
    });

    this.isCriticalPolicyViolated$ = this.etxn$.pipe(
      map(etxn => this.isNumber(etxn.tx_policy_amount) && etxn.tx_policy_amount < 0.0001),
    );
  }
}