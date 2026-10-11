import * as migration_20261007_130233_baseline from './20261007_130233_baseline';
import * as migration_20261007_130308_add_password_login from './20261007_130308_add_password_login';
import * as migration_20261007_130337_remove_login_codes from './20261007_130337_remove_login_codes';
import * as migration_20261007_133112_merge_admin_content from './20261007_133112_merge_admin_content';
import * as migration_20261007_133205_remove_merged_leftovers from './20261007_133205_remove_merged_leftovers';
import * as migration_20261007_154551_checkbox_defaults from './20261007_154551_checkbox_defaults';
import * as migration_20261007_161826_site_stats from './20261007_161826_site_stats';
import * as migration_20261007_175826_simplify_add_forms_ebook from './20261007_175826_simplify_add_forms_ebook';
import * as migration_20261007_175934_simplify_remove_old from './20261007_175934_simplify_remove_old';

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
    name: '20261007_175934_simplify_remove_old'
  },
];
