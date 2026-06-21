export {
  completeProfile,
  useCompleteProfile,
  EMAIL_ALREADY_EXISTS_CODE,
  type CompleteProfileResponse,
  type CompleteProfileInput,
} from './complete-profile';
export {
  getTechnicianStatus,
  useTechnicianStatus,
  technicianStatusQueryKey,
  isApproved,
  isSuspended,
  TECHNICIAN_STATUS,
  type TechnicianStatus,
} from './get-technician-status';
export { getRegions, useRegions, regionsQueryKey, type Region } from './get-regions';
export {
  getSubscriptionPlans,
  useSubscriptionPlans,
  subscriptionPlansQueryKey,
} from './get-subscription-plans';
export {
  getServiceCategories,
  useServiceCategories,
  serviceCategoriesQueryKey,
} from './get-service-categories';
export {
  getServiceSubcategories,
  useServiceSubcategories,
  serviceSubcategoriesQueryKey,
} from './get-service-subcategories';
export { subscribePlan } from './subscribe-plan';
export { addTechnicianServices } from './add-technician-services';
export { completeOnboarding } from './complete-onboarding';
export type { SetupPlan, SetupService } from '../schemas/setup';
