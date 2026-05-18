/**
 * Conventional Commits — enforced on every `git commit` via .husky/commit-msg.
 *
 * Format: <type>(<scope>): <subject>
 *   type   — feat | fix | docs | style | refactor | perf | test | build | ci | chore | revert
 *   scope  — optional, lowercase, kebab-case (feature/folder name)
 *   subject — imperative mood, lowercase, no trailing period
 *
 * Examples:
 *   feat(technicians): add profile page skeleton
 *   fix(i18n): correct Arabic plural for "review"
 *   docs(tech-stack): pin lucide-react to 1.x
 *   chore: bump lockfile
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [1, 'always', 100],
    'subject-case': [2, 'always', 'lower-case'],
  },
};
