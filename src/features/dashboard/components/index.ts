export { ApprovedProjectDetail } from './approved-project-detail';
export { CreateProjectWizard } from './project-create/create-project-wizard';
export { CreateProjectChooser } from './project-create/create-project-chooser';
export { CreateProjectMethod } from './project-create/create-project-method';
export { OmdahInterview } from './project-create/ai/omdah-interview';
export { AssignedProjectDetail } from './assigned-project-detail';
export { CompletedProjectDetail } from './completed-project-detail';
export { CustomerApprovedDetail } from './customer-approved-detail';
export { CustomerInProgressDetail } from './customer-in-progress-detail';
export { PaymentCallbackView } from './payment-callback';
export { PaymentWidgetView } from './payment-widget';
export { DashboardHero } from './dashboard-hero';
export { InProgressProjectDetail } from './in-progress-project-detail';
export { DashboardSearch } from './dashboard-search';
export { JobOfferDetail } from './job-offer-detail';
export { JobOffersSection } from './job-offers-section';
export { ProjectCarousel } from './project-carousel';
export { ProjectEditModal } from './project-edit';
export { ProjectStatCards } from './project-stat-cards';
export { ProjectsEmptyState } from './projects-empty-state';
export { ProjectsToolbar, PROJECT_FILTERS, type ProjectFilterKey } from './projects-toolbar';
export { ProjectStatusBadge } from './project-status-badge';
export { ProjectsTable } from './projects-table';
export { ProjectsView } from './projects-view';
export { CustomerProjectsView } from './customer-projects-view';
export { TransactionsView } from './transactions/transactions-view';
export { SupervisionScreen } from './supervision';
export { SupervisionControlPanel } from './supervision';
export { SupervisionInvitesHomeSection } from './supervision';

/* Dashboard landing — role-branched at /dashboard (server-side by user.role).
   Technicians get the new tracking dashboard ({@link TechnicianDashboardHome});
   the discover/job-offers landing ({@link TechnicianDashboard}) moved to
   /dashboard/job-offers. Customers (USER) get {@link CustomerDashboard}. */
export { TechnicianDashboard } from './technician-dashboard';
export { TechnicianDashboardHome } from './technician-dashboard-home';
export { CustomerDashboard } from './customer/customer-dashboard';
