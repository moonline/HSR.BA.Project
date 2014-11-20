# --- !Ups

create table dksmapping (
    id bigint not null,
    dksnode varchar(255) not null,
    tasktemplate_id bigint not null,
    primary key (id)
);
create table mapping (
    id bigint not null,
    name varchar(255),
    requesttemplate clob,
    url varchar(255),
    ppt_id bigint,
    project_id bigint,
    primary key (id)
);
create table person (
    id bigint not null,
    name varchar(255),
    passwordhash binary(255),
    salt binary(255),
    primary key (id)
);
create table ppt (
    id bigint not null,
    name varchar(255),
    primary key (id)
);
create table pptaccount (
    id bigint not null,
    pptpassword varchar(255),
    ppturl varchar(255),
    pptusername varchar(255),
    ppt_id bigint,
    user_id bigint,
    primary key (id)
);
create table processor (
    id bigint not null,
    code clob,
    name varchar(255),
    project_id bigint,
    primary key (id)
);
create table project (
    id bigint not null,
    name varchar(255),
    primary key (id)
);
create table task (
    id bigint not null,
    finalrequestcontent clob,
    finalrequesturl varchar(255),
    finalresponsecontent varchar(255),
    finalresponsestatus integer not null,
    createdfrom_id bigint,
    project_id bigint,
    primary key (id)
);
create table taskproperty (
    id bigint not null,
    name varchar(255),
    primary key (id)
);
create table taskpropertyvalue (
    id bigint not null,
    value varchar(255),
    property_id bigint not null,
    task_id bigint not null,
    primary key (id)
);
create table tasktemplate (
    id bigint not null,
    name varchar(255),
    parent_id bigint,
    primary key (id)
);

alter table dksmapping
    add constraint fk_p46gjuvoa8bfdl1x58lmmc8fg
    foreign key (tasktemplate_id)
    references tasktemplate;
alter table mapping
    add constraint fk_8olrrhqn1iq72l3c1syqovivq
    foreign key (ppt_id)
    references ppt;
alter table mapping
    add constraint fk_odpw0yawpljxoiw7nxo2ci9ep
    foreign key (project_id)
    references project;
alter table pptaccount
    add constraint fk_ah1kp16nv53avs0s61b0qfje2
    foreign key (ppt_id)
    references ppt;
alter table pptaccount
    add constraint fk_jpo3oot8ssbfu986lj40tefbh
    foreign key (user_id)
    references person;
alter table processor
    add constraint fk_ic7kyrx0xecunb6vhg8yywsyf
    foreign key (project_id)
    references project;
alter table task
    add constraint fk_b7i81l1tk1ph95xnhtoftyv53
    foreign key (project_id)
    references project;
alter table task
    add constraint fk_co2abyp3110xfdu6lujtkxjd8
    foreign key (createdfrom_id)
    references tasktemplate;
alter table taskpropertyvalue
    add constraint fk_5rv22d7ar67c7y51v2fseaums
    foreign key (property_id)
    references taskproperty;
alter table tasktemplate
    add constraint fk_2wtpsk3lq7w8v5y6ldc4pboar
    foreign key (parent_id)
    references tasktemplate;

create sequence entity_seq;

# --- !Downs

SET REFERENTIAL_INTEGRITY FALSE;

drop table if exists dksmapping;
drop table if exists mapping;
drop table if exists person;
drop table if exists ppt;
drop table if exists pptaccount;
drop table if exists processor;
drop table if exists project;
drop table if exists task;
drop table if exists taskproperty;
drop table if exists taskpropertyvalue;
drop table if exists tasktemplate;

SET REFERENTIAL_INTEGRITY TRUE;

drop sequence entity_seq;
