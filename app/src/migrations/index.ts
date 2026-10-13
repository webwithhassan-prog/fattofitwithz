import * as migration_20261007_130233_baseline from './20261007_130233_baseline';
import * as migration_20261007_130308_add_password_login from './20261007_130308_add_password_login';
import * as migration_20261007_130337_remove_login_codes from './20261007_130337_remove_login_codes';
import * as migration_20261007_133112_merge_admin_content from './20261007_133112_merge_admin_content';
import * as migration_20261007_133205_remove_merged_leftovers from './20261007_133205_remove_merged_leftovers';
import * as migration_20261007_154551_checkbox_defaults from './20261007_154551_checkbox_defaults';
import * as migration_20261007_161826_site_stats from './20261007_161826_site_stats';
import * as migration_20261007_175826_simplify_add_forms_ebook from './20261007_175826_simplify_add_forms_ebook';
import * as migration_20261007_175934_simplify_remove_old from './20261007_175934_simplify_remove_old';
import * as migration_20261012_182146_goal_health_concern from './20261012_182146_goal_health_concern';
import * as migration_20261012_184719_media_files from './20261012_184719_media_files';
import * as migration_20261012_193109_admin_tasks_issues_photos from './20261012_193109_admin_tasks_issues_photos';
import * as migration_20261013_090000_ebook_menu_and_faq from './20261013_090000_ebook_menu_and_faq';
import * as migration_20261013_163631_remove_about_events from './20261013_163631_remove_about_events';
import * as migration_20261013_170000_rate_limits from './20261013_170000_rate_limits';

export const migrations = [
  {
    up: migration_20261007_130233_baseline.up,
    down: migration_20261007_130233_baseline.down,
    name: '20261007_130233_baseline',
  },
  {
    up: migration_20261007_130308_add_password_login.up,
    down: migration_20261007_130308_add_password_login.down,
    name: '20261007_130308_add_password_login',
  },
  {
    up: migration_20261007_130337_remove_login_codes.up,
    down: migration_20261007_130337_remove_login_codes.down,
    name: '20261007_130337_remove_login_codes',
  },
  {
    up: migration_20261007_133112_merge_admin_content.up,
    down: migration_20261007_133112_merge_admin_content.down,
    name: '20261007_133112_merge_admin_content',
  },
  {
    up: migration_20261007_133205_remove_merged_leftovers.up,
    down: migration_20261007_133205_remove_merged_leftovers.down,
    name: '20261007_133205_remove_merged_leftovers',
  },
  {
    up: migration_20261007_154551_checkbox_defaults.up,
    down: migration_20261007_154551_checkbox_defaults.down,
    name: '20261007_154551_checkbox_defaults',
  },
  {
    up: migration_20261007_161826_site_stats.up,
    down: migration_20261007_161826_site_stats.down,
    name: '20261007_161826_site_stats',
  },
  {
    up: migration_20261007_175826_simplify_add_forms_ebook.up,
    down: migration_20261007_175826_simplify_add_forms_ebook.down,
    name: '20261007_175826_simplify_add_forms_ebook',
  },
  {
    up: migration_20261007_175934_simplify_remove_old.up,
    down: migration_20261007_175934_simplify_remove_old.down,
    name: '20261007_175934_simplify_remove_old',
  },
  {
    up: migration_20261012_182146_goal_health_concern.up,
    down: migration_20261012_182146_goal_health_concern.down,
    name: '20261012_182146_goal_health_concern',
  },
  {
    up: migration_20261012_184719_media_files.up,
    down: migration_20261012_184719_media_files.down,
    name: '20261012_184719_media_files',
  },
  {
    up: migration_20261012_193109_admin_tasks_issues_photos.up,
    down: migration_20261012_193109_admin_tasks_issues_photos.down,
    name: '20261012_193109_admin_tasks_issues_photos',
  },
  {
    up: migration_20261013_090000_ebook_menu_and_faq.up,
    down: migration_20261013_090000_ebook_menu_and_faq.down,
    name: '20261013_090000_ebook_menu_and_faq',
  },
  {
    up: migration_20261013_163631_remove_about_events.up,
    down: migration_20261013_163631_remove_about_events.down,
    name: '20261013_163631_remove_about_events'
  },
  {
    up: migration_20261013_170000_rate_limits.up,
    down: migration_20261013_170000_rate_limits.down,
    name: '20261013_170000_rate_limits',
  },
];
