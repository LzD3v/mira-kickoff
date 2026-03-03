import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  DestroyRef,
  inject,
  signal,
  computed,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from '@ui/button/ui-button.component';
import { UiCardComponent } from '@ui/card/ui-card.component';
import { UiEmptyStateComponent } from '@ui/empty-state/ui-empty-state.component';
import { UiErrorStateComponent } from '@ui/error-state/ui-error-state.component';
import { UiSkeletonComponent } from '@ui/skeleton/ui-skeleton.component';
import { ModalService } from '@core/services/modal.service';
import { ToastService } from '@core/services/toast.service';
import { UiInputComponent } from '@ui/input/ui-input.component';
import { UiTextareaComponent } from '@ui/textarea/ui-textarea.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type ViewState = 'loading' | 'empty' | 'error' | 'ready';
type TaskStatus = 'open' | 'done';
type Priority = 'low' | 'normal' | 'urgent';
type Filter = 'all' | 'open' | 'done';
type Sort = 'smart' | 'due' | 'newest';
type Category = 'finance' | 'personal' | 'work';

type Task = {
  id: string;
  title: string;
  due: string;
  status: TaskStatus;
  priority: Priority;
  category: Category;
  notes: string;
  createdAt: number;
};

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UiButtonComponent,
    UiCardComponent,
    UiEmptyStateComponent,
    UiErrorStateComponent,
    UiSkeletonComponent,
    UiInputComponent,
    UiTextareaComponent,
    TranslateModule,
  ],
  template: `
    <div class="top">
      <div>
        <div class="title">{{ 'TASKS.TITLE' | translate }}</div>
        <div class="muted sub">{{ 'TASKS.SUB' | translate }}</div>
      </div>

      <div class="actions">
        <mira-ui-button variant="ghost" (click)="simulate('loading')">
          {{ 'TASKS.ACTIONS.SIM_LOADING' | translate }}
        </mira-ui-button>

        <mira-ui-button variant="ghost" (click)="simulate('error')">
          {{ 'TASKS.ACTIONS.SIM_ERROR' | translate }}
        </mira-ui-button>

        <mira-ui-button
          variant="secondary"
          (click)="completeSelected()"
          [disabled]="selectedOpenCount() === 0 || state() !== 'ready'"
        >
          {{ 'TASKS.ACTIONS.COMPLETE_SELECTED' | translate:{ n: selectedOpenCount() } }}
        </mira-ui-button>

        <mira-ui-button
          variant="ghost"
          (click)="openBulkDelete()"
          [disabled]="selectedCount() === 0 || state() !== 'ready'"
        >
          {{ 'TASKS.ACTIONS.DELETE_SELECTED' | translate }}
        </mira-ui-button>

        <mira-ui-button variant="primary" (click)="openCreate()">
          {{ 'TASKS.ACTIONS.CREATE' | translate }}
        </mira-ui-button>
      </div>
    </div>

    <mira-ui-card class="panel">
      <ng-container [ngSwitch]="state()">
        <!-- LOADING -->
        <div *ngSwitchCase="'loading'" class="list">
          <div class="rowSkel" *ngFor="let i of [1,2,3,4,5]">
            <mira-ui-skeleton width="24" height="24" radius="999"></mira-ui-skeleton>
            <mira-ui-skeleton class="skFill" height="14" radius="12"></mira-ui-skeleton>
            <mira-ui-skeleton class="skFill" height="14" radius="12"></mira-ui-skeleton>
            <mira-ui-skeleton class="skFill" height="14" radius="12"></mira-ui-skeleton>
          </div>
        </div>

        <!-- ERROR -->
        <mira-ui-error-state
          *ngSwitchCase="'error'"
          [title]="'TASKS.STATES.ERROR.TITLE' | translate"
          [description]="'TASKS.STATES.ERROR.DESC' | translate"
          [actionLabel]="'TASKS.STATES.ERROR.ACTION' | translate"
          [action]="retry"
        />

        <!-- EMPTY -->
        <mira-ui-empty-state
          *ngSwitchCase="'empty'"
          [title]="'TASKS.STATES.EMPTY.TITLE' | translate"
          [description]="'TASKS.STATES.EMPTY.DESC' | translate"
          [actionLabel]="'TASKS.STATES.EMPTY.ACTION' | translate"
          [action]="openCreate"
        />

        <!-- READY -->
        <div *ngSwitchCase="'ready'" class="ready">
          <div class="toolbar">
            <div class="filters" role="tablist" [attr.aria-label]="'TASKS.TOOLBAR.FILTER_ARIA' | translate">
              <button class="chip focus-ring" type="button" (click)="filter.set('all')" [class.is-active]="filter() === 'all'">
                {{ 'TASKS.FILTER.ALL' | translate }} <span class="muted">({{ totalCount() }})</span>
              </button>
              <button class="chip focus-ring" type="button" (click)="filter.set('open')" [class.is-active]="filter() === 'open'">
                {{ 'TASKS.FILTER.OPEN' | translate }} <span class="muted">({{ openCount() }})</span>
              </button>
              <button class="chip focus-ring" type="button" (click)="filter.set('done')" [class.is-active]="filter() === 'done'">
                {{ 'TASKS.FILTER.DONE' | translate }} <span class="muted">({{ doneCount() }})</span>
              </button>
            </div>

            <div class="bulk">
              <button class="linkBtn focus-ring" type="button" (click)="selectAllVisible()" [disabled]="visibleTasks().length === 0">
                {{ 'TASKS.BULK.SELECT_VISIBLE' | translate }}
              </button>
              <span class="muted sep">•</span>
              <button class="linkBtn focus-ring" type="button" (click)="clearSelection()" [disabled]="selectedCount() === 0">
                {{ 'TASKS.BULK.CLEAR' | translate:{ n: selectedCount() } }}
              </button>
            </div>
          </div>

          <div class="tools">
            <div class="search">
              <label class="searchField">
                <span class="searchField__label">{{ 'TASKS.TOOLS.SEARCH' | translate }}</span>
                <input
                  class="searchField__input focus-ring"
                  type="text"
                  [value]="query()"
                  (input)="onQuery(($any($event.target).value || '').toString())"
                  [placeholder]="'TASKS.TOOLS.SEARCH_PH' | translate"
                  autocomplete="off"
                />
              </label>
            </div>

            <label class="field field--sort">
              <span class="field__label">{{ 'TASKS.TOOLS.SORT' | translate }}</span>
              <select class="select focus-ring" [value]="sort()" (change)="onSortChange($any($event.target).value)">
                <option value="smart">{{ 'TASKS.SORT.SMART' | translate }}</option>
                <option value="due">{{ 'TASKS.SORT.DUE' | translate }}</option>
                <option value="newest">{{ 'TASKS.SORT.NEWEST' | translate }}</option>
              </select>
            </label>
          </div>

          <div class="split">
            <div class="left">
              <div class="list">
                <div class="item" *ngFor="let t of visibleTasks(); trackBy: trackById" [class.is-done]="t.status === 'done'">
                  <label class="dotPick">
                    <input
                      type="checkbox"
                      [checked]="isSelected(t.id)"
                      (change)="toggleSelected(t.id, $any($event.target).checked)"
                    />
                    <span class="dotPick__ui" aria-hidden="true"></span>
                    <span class="sr-only">{{ 'TASKS.LIST.SELECT' | translate }}</span>
                  </label>

                  <button
                    type="button"
                    class="main mainBtn focus-ring"
                    (click)="openDetail(t)"
                    [attr.aria-label]="'TASKS.LIST.OPEN_DETAILS_ARIA' | translate"
                  >
                    <div class="main__top">
                      <div class="item__title">{{ t.title }}</div>
                      <span class="cat muted">{{ categoryLabel(t.category) }}</span>
                    </div>

                    <div class="item__meta muted">
                      {{ 'TASKS.LIST.DUE' | translate }}: <b>{{ t.due }}</b>
                      <span class="dot">•</span>
                      {{ t.status === 'open' ? ('TASKS.STATUS.OPEN_HINT' | translate) : ('TASKS.STATUS.DONE' | translate) }}
                      <span class="dot">•</span>
                      <span class="muted">
                        {{ 'TASKS.LIST.NOTES' | translate }}:
                        {{
                          t.notes
                            ? (t.notes | slice:0:52) + (t.notes.length > 52 ? '…' : '')
                            : '—'
                        }}
                      </span>
                    </div>
                  </button>

                  <div class="item__actions">
                    <span class="badge" [attr.data-pri]="t.priority">{{ priorityLabel(t.priority) }}</span>

                    <button
                      class="iconBtn focus-ring"
                      type="button"
                      (click)="$event.stopPropagation(); openEdit(t)"
                      [attr.aria-label]="'TASKS.LIST.EDIT' | translate"
                    >✎</button>

                    <button
                      class="iconBtn focus-ring"
                      type="button"
                      (click)="$event.stopPropagation(); openDelete(t.id)"
                      [attr.aria-label]="'TASKS.LIST.DELETE' | translate"
                    >🗑</button>
                  </div>
                </div>

                <div class="muted hint" *ngIf="visibleTasks().length === 0">
                  {{ 'TASKS.LIST.NONE' | translate }}
                </div>
              </div>
            </div>

            <div class="right">
              <div class="agenda">
                <div class="agenda__head">
                  <div>
                    <div class="agenda__title">{{ 'TASKS.AGENDA.TITLE' | translate }}</div>
                    <div class="muted agenda__sub">{{ 'TASKS.AGENDA.SUB' | translate }}</div>
                  </div>
                  <button class="ghostBtn focus-ring" type="button" (click)="agendaDay.set(0)">
                    {{ 'TASKS.AGENDA.TODAY' | translate }}
                  </button>
                </div>

                <div class="days" role="tablist" [attr.aria-label]="'TASKS.AGENDA.DAYS_ARIA' | translate">
                  <button
                    class="day focus-ring"
                    *ngFor="let d of agendaDays(); let i = index"
                    type="button"
                    [class.is-active]="agendaDay() === i"
                    (click)="agendaDay.set(i)"
                  >
                    <div class="day__k muted">{{ d.k }}</div>
                    <div class="day__n">{{ d.n }}</div>
                    <div class="day__c">
                      <span class="countPill" [class.is-empty]="d.c === '—'">{{ d.c }}</span>
                    </div>
                  </button>
                </div>

                <div class="agenda__list">
                  <div class="aItem" *ngFor="let t of agendaTasks(); trackBy: trackById">
                    <div class="aItem__top">
                      <div class="aItem__t">{{ t.title }}</div>
                      <span class="badge mini" [attr.data-pri]="t.priority">{{ priorityLabel(t.priority) }}</span>
                    </div>
                    <div class="muted aItem__m">
                      {{ 'TASKS.LIST.DUE' | translate }}: {{ t.due }} • {{ categoryLabel(t.category) }}
                    </div>
                  </div>

                  <div class="muted aEmpty" *ngIf="agendaTasks().length === 0">
                    {{ 'TASKS.AGENDA.EMPTY' | translate }}
                  </div>
                </div>

                <div class="muted agenda__note">
                  {{ 'TASKS.AGENDA.NOTE' | translate }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </mira-ui-card>

    <!-- MODAL: editor (create/edit) -->
    <ng-template #editorTpl>
      <form class="form" [formGroup]="form">
        <mira-ui-input
          [label]="'TASKS.EDITOR.TITLE_LABEL' | translate"
          placeholder="Ex.: Pagar cartão"
          formControlName="title"
        />

        <div class="two">
          <mira-ui-input
            [label]="'TASKS.EDITOR.DUE_LABEL' | translate"
            placeholder="Ex.: 25/04"
            formControlName="due"
          />

          <label class="field">
            <span class="field__label">{{ 'TASKS.EDITOR.PRIORITY' | translate }}</span>
            <select class="select focus-ring" formControlName="priority">
              <option value="low">{{ 'TASKS.PRIORITY.LOW' | translate }}</option>
              <option value="normal">{{ 'TASKS.PRIORITY.NORMAL' | translate }}</option>
              <option value="urgent">{{ 'TASKS.PRIORITY.URGENT' | translate }}</option>
            </select>
          </label>
        </div>

        <div class="two">
          <label class="field">
            <span class="field__label">{{ 'TASKS.EDITOR.CATEGORY' | translate }}</span>
            <select class="select focus-ring" formControlName="category">
              <option value="finance">{{ 'TASKS.CATEGORY.FINANCE' | translate }}</option>
              <option value="personal">{{ 'TASKS.CATEGORY.PERSONAL' | translate }}</option>
              <option value="work">{{ 'TASKS.CATEGORY.WORK' | translate }}</option>
            </select>
          </label>

          <div class="muted note">
            {{ 'TASKS.EDITOR.TIP' | translate }}
          </div>
        </div>

        <mira-ui-textarea
          [label]="'TASKS.EDITOR.NOTES_LABEL' | translate"
          [placeholder]="'TASKS.EDITOR.NOTES_PH' | translate"
          formControlName="notes"
          [rows]="4"
        />

        <div class="muted note">
          {{ 'TASKS.EDITOR.TODO' | translate }}
        </div>

        <div class="form__actions">
          <mira-ui-button variant="secondary" type="button" (click)="modal.close()">
            {{ 'COMMON.CANCEL' | translate }}
          </mira-ui-button>

          <mira-ui-button variant="primary" type="button" (click)="save()">
            {{
              editorMode() === 'create'
                ? ('TASKS.EDITOR.SAVE_MOCK' | translate)
                : ('TASKS.EDITOR.UPDATE_MOCK' | translate)
            }}
          </mira-ui-button>
        </div>
      </form>
    </ng-template>

    <!-- MODAL: delete single -->
    <ng-template #deleteTpl>
      <div class="confirm">
        <div class="confirm__title">{{ 'TASKS.DELETE.ONE_TITLE' | translate }}</div>
        <div class="muted confirm__desc">{{ 'TASKS.DELETE.ONE_DESC' | translate }}</div>

        <div class="confirm__actions">
          <mira-ui-button variant="secondary" type="button" (click)="modal.close()">
            {{ 'COMMON.CANCEL' | translate }}
          </mira-ui-button>
          <mira-ui-button variant="primary" type="button" (click)="confirmDelete()">
            {{ 'TASKS.DELETE.DELETE' | translate }}
          </mira-ui-button>
        </div>
      </div>
    </ng-template>

    <!-- MODAL: delete bulk -->
    <ng-template #bulkDeleteTpl>
      <div class="confirm">
        <div class="confirm__title">{{ 'TASKS.DELETE.BULK_TITLE' | translate }}</div>
        <div class="muted confirm__desc" [innerHTML]="'TASKS.DELETE.BULK_DESC_HTML' | translate:{ n: selectedCount() }"></div>

        <div class="confirm__actions">
          <mira-ui-button variant="secondary" type="button" (click)="modal.close()">
            {{ 'COMMON.CANCEL' | translate }}
          </mira-ui-button>
          <mira-ui-button variant="primary" type="button" (click)="confirmBulkDelete()">
            {{ 'TASKS.DELETE.DELETE' | translate }}
          </mira-ui-button>
        </div>
      </div>
    </ng-template>

    <!-- MODAL: details -->
    <ng-template #detailTpl>
      <div class="detail" *ngIf="detailTask() as t">
        <div class="detail__top">
          <div>
            <div class="detail__title">{{ t.title }}</div>
            <div class="muted detail__sub">
              {{ categoryLabel(t.category) }} • {{ priorityLabel(t.priority) }} •
              {{ t.status === 'open' ? ('TASKS.STATUS.OPEN' | translate) : ('TASKS.STATUS.DONE' | translate) }}
            </div>
          </div>
          <span class="badge" [attr.data-pri]="t.priority">{{ priorityLabel(t.priority) }}</span>
        </div>

        <div class="detail__meta">
          <div class="kv">
            <div class="muted kv__k">{{ 'TASKS.DETAIL.DUE' | translate }}</div>
            <div class="kv__v">{{ t.due }}</div>
          </div>
          <div class="kv">
            <div class="muted kv__k">{{ 'TASKS.DETAIL.STATUS' | translate }}</div>
            <div class="kv__v">
              {{ t.status === 'open' ? ('TASKS.STATUS.OPEN' | translate) : ('TASKS.STATUS.DONE' | translate) }}
            </div>
          </div>
          <div class="kv">
            <div class="muted kv__k">{{ 'TASKS.DETAIL.CATEGORY' | translate }}</div>
            <div class="kv__v">{{ categoryLabel(t.category) }}</div>
          </div>
        </div>

        <div class="detail__notes">
          <div class="detail__k">{{ 'TASKS.DETAIL.NOTES' | translate }}</div>
          <div class="muted detail__t">{{ t.notes || '—' }}</div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host{
        display:block;
        color: var(--text, rgba(255,255,255,0.92));
      }

      .top{
        display:flex;
        flex-wrap:wrap;
        gap:12px;
        align-items:flex-end;
        justify-content:space-between;
        margin-bottom:12px;
      }
      .title{ font-weight:950; font-size:20px; letter-spacing:-.25px; }
      .sub{ font-size:12.5px; margin-top:4px; opacity:.9; }

      .actions{
        display:inline-flex;
        flex-wrap:wrap;
        gap:10px;
        align-items:center;
      }

      mira-ui-card.panel{
        padding: 18px;
        border-radius: 24px;
        border: 1px solid rgba(255,255,255,0.10);
        background: linear-gradient(180deg, rgba(15,18,26,0.56), rgba(12,14,20,0.34));
        box-shadow: 0 24px 80px rgba(0,0,0,0.34);
        backdrop-filter: blur(12px);
      }

      .ready{ display:grid; gap:14px; }

      .toolbar{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        flex-wrap:wrap;

        padding: 12px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.03);
      }

      .filters{
        display:inline-flex;
        gap:10px;
        flex-wrap:wrap;
        align-items:center;
      }

      .chip{
        border:1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.04);
        color: var(--text, rgba(255,255,255,0.9));
        border-radius:999px;
        padding:9px 14px;
        cursor:pointer;
        transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
        font-size:13px;
        line-height: 1;
      }
      .chip:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.07); }
      .chip.is-active{
        background: linear-gradient(180deg, rgba(133,94,217,0.22), rgba(255,255,255,0.04));
        border-color: rgba(133,94,217,0.45);
        box-shadow: 0 14px 34px rgba(133,94,217,0.18);
      }

      .bulk{
        display:inline-flex;
        align-items:center;
        gap:10px;
        flex-wrap:wrap;
      }
      .linkBtn{
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.045);
        color: rgba(255,255,255,0.88);
        cursor:pointer;
        padding: 9px 12px;
        border-radius: 999px;
        transition: background 160ms ease, transform 160ms ease, border-color 160ms ease;
        font-size: 12.5px;
        font-weight: 800;
        letter-spacing: -.15px;
      }
      .linkBtn:hover{ background: rgba(255,255,255,0.075); transform: translateY(-1px); border-color: rgba(255,255,255,0.20); }
      .linkBtn:disabled{ opacity: .45; cursor:not-allowed; transform:none; }
      .sep{ font-size:12px; opacity:.8; }

      .tools{
        display:grid;
        grid-template-columns: 1fr minmax(280px, 360px);
        gap:12px;
        align-items:end;

        padding: 12px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.03);
      }
      @media (max-width: 860px){
        .tools{ grid-template-columns: 1fr; }
      }

      .search{ min-width:0; }

      .searchField {
        display: grid;
        gap: 7px;
        min-width: 0;
      }

      .searchField__label {
        font-size: 12px;
        color: var(--muted, rgba(255,255,255,0.72));
        font-weight: 800;
      }

      .searchField__input {
        width: 100%;
        border-radius: 16px;
        padding: 13px 14px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255, 255, 255, 0.045);
        color: var(--text, rgba(255,255,255,0.92));
        outline: none;
        transition: border-color 160ms ease, background 160ms ease;
      }
      .searchField__input:hover{ background: rgba(255,255,255,0.06); }
      .searchField__input:focus{ border-color: rgba(133,94,217,0.45); }

      .searchField__input::placeholder {
        color: rgba(255, 255, 255, 0.46);
      }

      .list{ display:grid; gap:10px; }

      .rowSkel{
        display:grid;
        grid-template-columns: 40px 1fr 140px 120px;
        align-items:center;
        gap:12px;
        padding:12px;
        border-radius:18px;
        border:1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.03);
      }
      .skFill{ width: 100%; }

      .split{
        display:grid;
        grid-template-columns: minmax(0, 70%) minmax(0, 30%);
        gap:14px;
        align-items:start;
      }
      @media (max-width: 980px){
        .split{ grid-template-columns: 1fr; }
      }

      .item{
        display:grid;
        grid-template-columns: 40px 1fr auto;
        align-items:center;
        gap:12px;
        padding:14px;
        border-radius:20px;
        border:1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.035);
        transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
      }
      .item:hover{
        transform: translateY(-1px);
        background: rgba(255,255,255,0.055);
        border-color: rgba(255,255,255,0.14);
      }
      .item.is-done{
        opacity: 0.78;
      }
      .item.is-done .item__title{
        text-decoration: line-through;
        text-decoration-thickness: 2px;
        text-decoration-color: rgba(255,255,255,0.28);
      }

      .dotPick{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        width: 40px;
        height: 40px;
        position: relative;
      }
      .dotPick input{
        position:absolute;
        inset:0;
        opacity:0;
        cursor:pointer;
      }
      .dotPick__ui{
        width: 16px;
        height: 16px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.18);
        background: rgba(255,255,255,0.06);
        box-shadow: 0 12px 28px rgba(0,0,0,0.22);
        transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
      }
      .dotPick input:checked + .dotPick__ui{
        border-color: rgba(133,94,217,0.55);
        background: radial-gradient(circle at 30% 20%, rgba(132,210,244,0.9), rgba(133,94,217,0.92));
        box-shadow: 0 16px 34px rgba(133,94,217,0.22);
        transform: translateY(-1px);
      }

      .main{ min-width:0; }
      .main__top{
        display:flex;
        align-items:baseline;
        justify-content:space-between;
        gap:10px;
      }
      .item__title{
        font-weight: 950;
        letter-spacing: -0.2px;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        font-size: 14px;
      }
      .cat{
        font-size: 12px;
        white-space: nowrap;
        opacity: .9;
      }
      .item__meta{
        margin-top: 5px;
        font-size: 12.5px;
        line-height: 1.4;
      }
      .dot{ margin: 0 7px; opacity:.7; }

      .item__actions{
        display:inline-flex;
        gap:8px;
        align-items:center;
      }

      .badge{
        font-size: 12px;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.04);
        white-space: nowrap;
        line-height: 1;
        display:inline-flex;
        align-items:center;
        justify-content:center;
      }
      .badge[data-pri='low']{
        border-color: rgba(255,255,255,0.16);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.78);
      }
      .badge[data-pri='normal']{
        border-color: rgba(132,210,244,0.30);
        background: rgba(132,210,244,0.11);
      }
      .badge[data-pri='urgent']{
        border-color: rgba(255,92,122,0.38);
        background: rgba(255,92,122,0.13);
      }
      .badge.mini{
        padding: 6px 10px;
        font-size: 12px;
      }

      .iconBtn{
        width: 40px;
        height: 40px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.04);
        color: var(--text, rgba(255,255,255,0.92));
        cursor:pointer;
        transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
        display:grid;
        place-items:center;
      }
      .iconBtn:hover{
        transform: translateY(-1px);
        background: rgba(255,255,255,0.08);
        border-color: rgba(255,255,255,0.20);
      }

      .hint{
        font-size: 12px;
        padding: 8px 2px;
      }

      .form{ display:grid; gap:12px; }
      .two{
        display:grid;
        grid-template-columns: 1fr 220px;
        gap:12px;
        align-items:end;
      }
      @media (max-width: 640px){
        .two{ grid-template-columns: 1fr; }
      }

      .field{ display:grid; gap:7px; }
      .field__label{
        font-size: 12px;
        color: var(--muted, rgba(255,255,255,0.72));
        font-weight: 800;
      }

      .select{
        width: 100%;
        border-radius: 16px;
        padding: 13px 44px 13px 14px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.045);
        color: var(--text, rgba(255,255,255,0.92));
        outline: none;
        min-height: 46px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: border-color 160ms ease, background 160ms ease;
      }
      .select:hover{ background: rgba(255,255,255,0.06); }
      .select:focus{ border-color: rgba(133,94,217,0.45); }

      .select option{
        background: rgba(12,14,20,1);
        color: rgba(255,255,255,0.92);
      }

      .note{ font-size: 12px; line-height: 1.4; }

      .form__actions{
        display:flex;
        justify-content:flex-end;
        gap:10px;
        margin-top: 2px;
      }

      .confirm{ display:grid; gap:10px; }
      .confirm__title{ font-weight: 950; letter-spacing: -0.2px; }
      .confirm__desc{ font-size: 12px; line-height: 1.4; }
      .confirm__actions{ display:flex; justify-content:flex-end; gap:10px; margin-top: 6px; }

      .agenda{
        border: 1px solid rgba(255,255,255,0.10);
        background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02));
        border-radius: 24px;
        padding: 16px;
        box-shadow: 0 22px 70px rgba(0,0,0,0.18);
      }
      .agenda__head{
        display:flex;
        align-items:flex-end;
        justify-content:space-between;
        gap:12px;
      }
      .agenda__title{
        font-weight: 950;
        letter-spacing: -0.2px;
        font-size: 14px;
      }
      .agenda__sub{
        font-size: 12.5px;
        margin-top: 3px;
      }
      .ghostBtn{
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.05);
        color: var(--text, rgba(255,255,255,0.92));
        border-radius: 999px;
        padding: 9px 12px;
        cursor:pointer;
        transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
        font-size: 12.5px;
        font-weight: 800;
      }
      .ghostBtn:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.22); }

      .days{
        margin-top: 12px;
        display:grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 8px;
      }
      .day{
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.03);
        min-width: 0;
        border-radius: 16px;
        padding: 10px 8px;
        text-align:center;
        cursor:pointer;
        transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
        min-height: 76px;
      }
      .day__k, .day__n{
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .countPill{
        min-width: 0;
        padding: 0 8px;
      }
      .day:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.18); }
      .day.is-active{
        border-color: rgba(133,94,217,0.42);
        background: linear-gradient(180deg, rgba(133,94,217,0.20), rgba(255,255,255,0.03));
        box-shadow: 0 16px 40px rgba(133,94,217,0.18);
      }
      .day__k{ font-size: 12px; }
      .day__n{ font-weight: 950; letter-spacing: -0.2px; margin-top: 4px; font-size: 16px; }
      .day__c{ margin-top: 6px; display:flex; justify-content:center; }

      .countPill{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        height: 22px;
        min-width: 28px;
        padding: 0 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 900;
        border: 1px solid rgba(132,210,244,0.30);
        background: rgba(132,210,244,0.10);
        color: rgba(255,255,255,0.92);
      }
      .countPill.is-empty{
        border-color: rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.03);
        color: rgba(255,255,255,0.70);
      }

      .agenda__list{
        margin-top: 14px;
        display:grid;
        gap: 10px;
        max-height: 280px;
        overflow:auto;
        padding-right: 4px;
      }

      .aItem{
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.03);
        border-radius: 18px;
        padding: 12px 12px;
        transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
      }
      .aItem:hover{
        transform: translateY(-1px);
        background: rgba(255,255,255,0.06);
        border-color: rgba(255,255,255,0.16);
      }
      .aItem__top{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap: 10px;
      }
      .aItem__t{
        font-weight: 900;
        font-size: 13px;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }
      .aItem__m{ font-size: 12.5px; margin-top: 5px; }
      .aEmpty{ font-size: 12.5px; padding: 6px 2px; }

      .agenda__note{
        margin-top: 12px;
        font-size: 12.5px;
      }

      @media (max-width: 540px){
        .days{ grid-template-columns: repeat(4, minmax(0, 1fr)); }
      }

      .sr-only{
        position:absolute !important;
        width:1px !important;
        height:1px !important;
        padding:0 !important;
        margin:-1px !important;
        overflow:hidden !important;
        clip:rect(0,0,0,0) !important;
        white-space:nowrap !important;
        border:0 !important;
      }

      @media (max-width: 560px){
        .item{
          grid-template-columns: 36px minmax(0, 1fr) 96px;
          gap: 10px;
          padding: 12px;
        }

        .main__top{
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          gap: 4px;
        }

        .item__title{
          white-space: normal;
          overflow: visible;
          text-overflow: clip;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .cat{
          font-size: 11.5px;
          opacity: .85;
        }

        .item__meta{
          font-size: 12.5px;
          line-height: 1.35;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .item__actions{
          width: 96px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          justify-items: center;
          align-content: start;
          gap: 8px;
        }

        .item__actions .badge{
          grid-column: 1 / -1;
          justify-self: end;
          padding: 6px 10px;
          font-size: 11.5px;
        }

        .iconBtn{
          width: 36px;
          height: 36px;
          border-radius: 12px;
        }

        .dotPick{
          width: 36px;
          height: 36px;
        }
      }

      .mainBtn{
        background: transparent;
        border: 0;
        padding: 0;
        margin: 0;
        width: 100%;
        text-align: left;
        color: inherit;
        cursor: pointer;
      }

      .detail{
        display: grid;
        gap: 12px;
        animation: sheetUp 200ms ease both;
        max-width: 720px;
      }

      .detail__top{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap: 10px;
      }

      .detail__title{
        font-weight: 950;
        letter-spacing: -0.2px;
        font-size: 16px;
        line-height: 1.2;
      }

      .detail__sub{
        margin-top: 4px;
        font-size: 12.5px;
      }

      .detail__meta{
        display:grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.03);
        border-radius: 16px;
        padding: 10px;
      }

      .kv{ display:grid; gap: 4px; }
      .kv__k{ font-size: 12px; font-weight: 800; }
      .kv__v{ font-size: 13px; font-weight: 900; }

      .detail__notes{
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.03);
        border-radius: 16px;
        padding: 12px;
      }

      .detail__k{ font-weight: 950; font-size: 12px; }
      .detail__t{ margin-top: 6px; font-size: 13px; line-height: 1.5; white-space: pre-wrap; }

      @media (max-width: 560px){
        .detail__meta{ grid-template-columns: 1fr; }
      }

      @keyframes sheetUp{
        from{ opacity: 0; transform: translateY(10px); }
        to{ opacity: 1; transform: translateY(0); }
      }

      @media (prefers-reduced-motion: reduce){
        .detail{ animation: none !important; }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPage {
  readonly modal = inject(ModalService);
  readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly locale = signal<string>('pt-BR');

  readonly editorTpl = viewChild<TemplateRef<unknown>>('editorTpl');
  readonly deleteTpl = viewChild<TemplateRef<unknown>>('deleteTpl');
  readonly bulkDeleteTpl = viewChild<TemplateRef<unknown>>('bulkDeleteTpl');
  readonly detailTpl = viewChild<TemplateRef<unknown>>('detailTpl');

  readonly detailTask = signal<Task | null>(null);

  readonly state = signal<ViewState>('loading');

  readonly tasks = signal<Task[]>([]);
  readonly filter = signal<Filter>('all');
  readonly sort = signal<Sort>('smart');
  readonly query = signal('');

  readonly selectedIds = signal<Set<string>>(new Set());

  readonly editorMode = signal<'create' | 'edit'>('create');
  readonly editingId = signal<string | null>(null);

  readonly pendingDeleteId = signal<string | null>(null);

  readonly agendaDay = signal(0);

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    due: ['', [Validators.required]],
    priority: ['normal' as Priority, [Validators.required]],
    category: ['finance' as Category, [Validators.required]],
    notes: [''],
  });

  readonly totalCount = computed(() => this.tasks().length);
  readonly openCount = computed(() => this.tasks().filter((t) => t.status === 'open').length);
  readonly doneCount = computed(() => this.tasks().filter((t) => t.status === 'done').length);

  readonly visibleTasks = computed(() => {
    // força recompute quando muda idioma
    this.locale();

    const f = this.filter();
    const q = (this.query() ?? '').trim().toLowerCase();
    const s = this.sort();
    const arr = this.tasks();

    let filtered =
      f === 'all' ? arr : arr.filter((t) => (f === 'open' ? t.status === 'open' : t.status === 'done'));

    if (q) {
      filtered = filtered.filter((t) => {
        const blob =
          `${t.title} ${t.notes} ${this.categoryLabel(t.category)} ${this.priorityLabel(t.priority)}`.toLowerCase();
        return blob.includes(q);
      });
    }

    const priRank: Record<Priority, number> = { urgent: 0, normal: 1, low: 2 };

    const sorters: Record<Sort, (a: Task, b: Task) => number> = {
      smart: (a, b) => {
        const pa = priRank[a.priority] - priRank[b.priority];
        if (pa !== 0) return pa;
        const da = this.dueSortable(a.due);
        const db = this.dueSortable(b.due);
        if (da !== db) return da - db;
        return b.createdAt - a.createdAt;
      },
      due: (a, b) => this.dueSortable(a.due) - this.dueSortable(b.due),
      newest: (a, b) => b.createdAt - a.createdAt,
    };

    return [...filtered].sort(sorters[s]);
  });

  readonly selectedCount = computed(() => this.selectedIds().size);

  readonly selectedOpenCount = computed(() => {
    const sel = this.selectedIds();
    const byId = new Set(sel);
    return this.tasks().filter((t) => byId.has(t.id) && t.status === 'open').length;
  });

  readonly agendaDays = computed(() => {
    // força recompute quando muda idioma
    this.locale();

    const base = new Date();
    base.setHours(0, 0, 0, 0);

    const days: { d: Date; k: string; n: string; c: string }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);

      const count = this.tasks().filter((t) => {
        const td = this.parseDueToDate(t.due);
        if (!td) return false;
        td.setHours(0, 0, 0, 0);
        return td.getTime() === d.getTime() && t.status === 'open';
      }).length;

      days.push({
        d,
        k: this.weekdayShort(d),
        n: String(d.getDate()).padStart(2, '0'),
        c: count ? `${count}` : '—',
      });
    }

    return days;
  });

  readonly agendaTasks = computed(() => {
    const days = this.agendaDays();
    const idx = Math.max(0, Math.min(days.length - 1, this.agendaDay()));
    const d = days[idx]?.d;
    if (!d) return [];

    const target = new Date(d);
    target.setHours(0, 0, 0, 0);

    const list = this.tasks()
      .filter((t) => {
        const td = this.parseDueToDate(t.due);
        if (!td) return false;
        td.setHours(0, 0, 0, 0);
        return td.getTime() === target.getTime();
      })
      .sort((a, b) => {
        const priRank: Record<Priority, number> = { urgent: 0, normal: 1, low: 2 };
        const pa = priRank[a.priority] - priRank[b.priority];
        if (pa !== 0) return pa;
        return a.status === b.status ? 0 : a.status === 'open' ? -1 : 1;
      });

    return list;
  });

  constructor() {
    const setLocale = () => {
      const l = (this.translate.currentLang || this.translate.defaultLang || 'pt-BR') as string;
      this.locale.set(l);
    };
    setLocale();
    const sub = this.translate.onLangChange.subscribe(() => setLocale());
    this.destroyRef.onDestroy(() => sub.unsubscribe());

    const seed: Task[] = [
      {
        id: this.id(),
        title: 'Pagar cartão',
        due: '25/04',
        status: 'open',
        priority: 'urgent',
        category: 'finance',
        notes: 'Conferir fatura e parcelamentos. Pagar até o fim do dia.',
        createdAt: Date.now() - 100000,
      },
      {
        id: this.id(),
        title: 'Revisar assinaturas',
        due: '30/04',
        status: 'open',
        priority: 'normal',
        category: 'personal',
        notes: 'Cancelar o que não usa mais e ajustar planos.',
        createdAt: Date.now() - 80000,
      },
      {
        id: this.id(),
        title: 'Separar reserva do mês',
        due: '15/04',
        status: 'done',
        priority: 'low',
        category: 'finance',
        notes: 'Reservinha automática + meta de longo prazo.',
        createdAt: Date.now() - 60000,
      },
    ];

    setTimeout(() => {
      this.tasks.set(seed);
      this.state.set(seed.length ? 'ready' : 'empty');
    }, 600);
  }

  openDetail(t: Task) {
    const tpl = this.detailTpl();
    if (!tpl) return;
    this.detailTask.set(t);
    this.modal.open(this.translate.instant('TASKS.MODAL.DETAIL_TITLE'), tpl);
  }

  onQuery(v: string) {
    this.query.set(v);
  }

  onSortChange(v: string) {
    const next = (v || 'smart') as Sort;
    this.sort.set(next);
  }

  simulate(kind: ViewState) {
    this.state.set(kind);
    if (kind === 'loading') {
      setTimeout(() => this.state.set(this.tasks().length ? 'ready' : 'empty'), 650);
    }
  }

  retry = () => this.simulate('loading');

  isSelected(id: string) {
    return this.selectedIds().has(id);
  }

  toggleSelected(id: string, checked: boolean) {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  clearSelection() {
    this.selectedIds.set(new Set());
  }

  selectAllVisible() {
    const ids = this.visibleTasks().map((t) => t.id);
    this.selectedIds.update((set) => {
      const next = new Set(set);
      for (const id of ids) next.add(id);
      return next;
    });
  }

  openCreate = () => {
    const tpl = this.editorTpl();
    if (!tpl) return;
    this.editorMode.set('create');
    this.editingId.set(null);
    this.form.reset({
      title: '',
      due: '',
      priority: 'normal',
      category: 'finance',
      notes: '',
    });
    this.modal.open(this.translate.instant('TASKS.MODAL.CREATE_TITLE'), tpl);
  };

  openEdit(t: Task) {
    const tpl = this.editorTpl();
    if (!tpl) return;
    this.editorMode.set('edit');
    this.editingId.set(t.id);
    this.form.reset({
      title: t.title,
      due: t.due,
      priority: t.priority,
      category: t.category,
      notes: t.notes ?? '',
    });
    this.modal.open(this.translate.instant('TASKS.MODAL.EDIT_TITLE'), tpl);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.push({
        type: 'warning',
        title: this.translate.instant('TASKS.TOAST.REVIEW_TITLE'),
        message: this.translate.instant('TASKS.TOAST.REVIEW_MSG'),
      });
      return;
    }

    const v = this.form.getRawValue();
    const title = (v.title ?? '').trim();
    const due = (v.due ?? '').trim();
    const priority = (v.priority ?? 'normal') as Priority;
    const category = (v.category ?? 'finance') as Category;
    const notes = (v.notes ?? '').toString().trim();

    if (!title || !due) return;

    if (this.editorMode() === 'create') {
      const t: Task = {
        id: this.id(),
        title,
        due,
        priority,
        category,
        notes,
        status: 'open',
        createdAt: Date.now(),
      };

      this.tasks.update((arr) => [t, ...arr]);
      this.state.set('ready');
      this.modal.close();

      this.form.reset({
        title: '',
        due: '',
        priority: 'normal',
        category: 'finance',
        notes: '',
      });

      this.toast.push({
        type: 'success',
        title: this.translate.instant('TASKS.TOAST.CREATED_TITLE'),
        message: this.translate.instant('TASKS.TOAST.CREATED_MSG'),
      });
      return;
    }

    const id = this.editingId();
    if (!id) return;

    this.tasks.update((arr) =>
      arr.map((t) => (t.id === id ? { ...t, title, due, priority, category, notes } : t)),
    );

    this.modal.close();
    this.toast.push({
      type: 'success',
      title: this.translate.instant('TASKS.TOAST.UPDATED_TITLE'),
      message: this.translate.instant('TASKS.TOAST.UPDATED_MSG'),
    });
  }

  completeSelected() {
    const sel = this.selectedIds();
    if (sel.size === 0) return;

    const openToComplete = this.tasks().filter((t) => sel.has(t.id) && t.status === 'open').length;
    if (openToComplete === 0) {
      this.toast.push({
        type: 'warning',
        title: this.translate.instant('TASKS.TOAST.NOTHING_TITLE'),
        message: this.translate.instant('TASKS.TOAST.NOTHING_MSG'),
      });
      return;
    }

    this.tasks.update((arr) =>
      arr.map((t) => (sel.has(t.id) && t.status === 'open' ? { ...t, status: 'done' } : t)),
    );

    this.clearSelection();

    this.toast.push({
      type: 'success',
      title: this.translate.instant('TASKS.TOAST.COMPLETED_TITLE'),
      message: this.translate.instant('TASKS.TOAST.COMPLETED_MSG', { n: openToComplete }),
    });
  }

  openDelete(id: string) {
    const tpl = this.deleteTpl();
    if (!tpl) return;
    this.pendingDeleteId.set(id);
    this.modal.open(this.translate.instant('TASKS.MODAL.DELETE_TITLE'), tpl);
  }

  confirmDelete() {
    const id = this.pendingDeleteId();
    if (!id) return;

    this.tasks.update((arr) => arr.filter((t) => t.id !== id));
    this.selectedIds.update((set) => {
      const next = new Set(set);
      next.delete(id);
      return next;
    });

    this.pendingDeleteId.set(null);
    this.modal.close();

    this.state.set(this.tasks().length ? 'ready' : 'empty');
    this.toast.push({
      type: 'success',
      title: this.translate.instant('TASKS.TOAST.REMOVED_TITLE'),
      message: this.translate.instant('TASKS.TOAST.REMOVED_MSG'),
    });
  }

  openBulkDelete() {
    const tpl = this.bulkDeleteTpl();
    if (!tpl) return;
    this.modal.open(this.translate.instant('TASKS.MODAL.BULK_DELETE_TITLE'), tpl);
  }

  confirmBulkDelete() {
    const sel = this.selectedIds();
    if (sel.size === 0) return;

    const n = sel.size;
    this.tasks.update((arr) => arr.filter((t) => !sel.has(t.id)));
    this.clearSelection();

    this.modal.close();
    this.state.set(this.tasks().length ? 'ready' : 'empty');

    this.toast.push({
      type: 'success',
      title: this.translate.instant('TASKS.TOAST.BULK_REMOVED_TITLE'),
      message: this.translate.instant('TASKS.TOAST.BULK_REMOVED_MSG', { n }),
    });
  }

  trackById = (_: number, t: Task) => t.id;

  private priorityKey(p: Priority) {
    if (p === 'urgent') return 'TASKS.PRIORITY.URGENT';
    if (p === 'low') return 'TASKS.PRIORITY.LOW';
    return 'TASKS.PRIORITY.NORMAL';
  }

  private categoryKey(c: Category) {
    if (c === 'work') return 'TASKS.CATEGORY.WORK';
    if (c === 'personal') return 'TASKS.CATEGORY.PERSONAL';
    return 'TASKS.CATEGORY.FINANCE';
  }

  priorityLabel(p: Priority) {
    // locale() aqui garante que recalcula quando muda idioma
    this.locale();
    return this.translate.instant(this.priorityKey(p));
  }

  categoryLabel(c: Category) {
    this.locale();
    return this.translate.instant(this.categoryKey(c));
  }

  private weekdayShort(d: Date) {
    try {
      const raw = new Intl.DateTimeFormat(this.locale(), { weekday: 'short' }).format(d);
      const cleaned = raw.replace('.', '').trim();
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    } catch {
      return '—';
    }
  }

  private id() {
    return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private dueSortable(due: string) {
    const td = this.parseDueToDate(due);
    if (!td) return Number.MAX_SAFE_INTEGER;
    return td.getTime();
  }

  private parseDueToDate(due: string): Date | null {
    const s = (due ?? '').trim();

    const m = s.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
    if (m) {
      const dd = Number(m[1]);
      const mm = Number(m[2]);
      let yy = Number(m[3] ?? new Date().getFullYear());
      if (yy < 100) yy += 2000;
      const d = new Date(yy, mm - 1, dd);
      if (Number.isNaN(d.getTime())) return null;
      return d;
    }

    const iso = Date.parse(s);
    if (!Number.isNaN(iso)) return new Date(iso);

    return null;
  }
}