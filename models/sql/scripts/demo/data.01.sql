insert into jsharmony.sys_user (sys_user_fname,sys_user_lname,sys_user_email,sys_user_pw1,sys_user_pw2,
                          sys_user_startdt, sys_user_stsdt, sys_user_euser, sys_user_etstmp, sys_user_muser, sys_user_mtstmp)
  values ('Demo','User','demo@jsharmony.com','Content@Work','Content@Work',
          date('now','localtime'),datetime('now','localtime'),(select context from jsharmony_meta limit 1),datetime('now','localtime'),(select context from jsharmony_meta limit 1),datetime('now','localtime'));

insert into jsharmony.sys_user_role (sys_user_id, sys_role_name) 
  select sys_user.sys_user_id,sys_role.sys_role_name
    from jsharmony.sys_user
    inner join jsharmony.sys_role on 1=1
    where sys_user_email in ('demo@jsharmony.com') and sys_role.sys_role_name not in ('DEV','SYSADMIN','*'); 

update cms.page set page_author = (select sys_user_id from jsharmony.sys_user where sys_user_email = 'demo@jsharmony.com');
delete from jsharmony.sys_user_role where sys_user_id = (select sys_user_id from jsharmony.sys_user where sys_user_email = 'admin@jsharmony.com');
delete from jsharmony.sys_user where sys_user_email = 'admin@jsharmony.com';

update cms.deployment_target set deployment_target_template_variables = replace(deployment_target_template_variables, 'localhost:', 'cms.jsharmony.com:');
