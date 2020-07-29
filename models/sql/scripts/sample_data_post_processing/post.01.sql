/* Careers Branch */
/* --------------*/

/* Create branch for new careers page */
insert into cms.v_my_current_branch(branch_parent_id, branch_type, branch_name) values(1, 'USER', 'Add Careers Page');
/* Create careers page */
insert into cms.v_my_page(page_path, page_title, page_template_id) values('/careers/', 'Careers', '2col_sidebar');
/* Update sitemap */
update cms.v_my_sitemap set sitemap_file_id=null where sitemap_type='PRIMARY';
/* Update footer menu */
update cms.v_my_menu set menu_file_id=null where menu_tag='footer';
/* Submit branch for review */
update cms.branch set branch_sts='REVIEW' where branch_id=cms.my_current_branch_id();

/* Create branch for new testimonials page */
insert into cms.v_my_current_branch(branch_parent_id, branch_type, branch_name) values(1, 'USER', 'Add Testimonials Page');
/* Create careers page */
insert into cms.v_my_page(page_path, page_title) values('/testimonials/', 'Testimonials');
/* Update sitemap */
update cms.v_my_sitemap set sitemap_file_id=null where sitemap_type='PRIMARY';
/* Update site menu */
update cms.v_my_menu set menu_file_id=null where menu_tag='main';
/* Update footer menu */
update cms.v_my_menu set menu_file_id=null where menu_tag='footer';
/* Submit branch for review */
update cms.branch set branch_sts='REVIEW' where branch_id=cms.my_current_branch_id();

/* Clone careers branch to add content */
insert into cms.v_my_current_branch(branch_parent_id, branch_type, branch_name) values(2, 'USER', 'Add Designer Job to Careers Page');
/* Update page */
update cms.v_my_page set page_file_id=null where page_path='/careers/index.html';

/* Set Editor */
/* 1 = Local */
update cms.site set site_default_editor = 1 where site_id = 1;