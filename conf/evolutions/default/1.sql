# --- !Ups

create table node (
    tasktemplate_id bigint not null,
    dksnode varchar(255)
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
create table taskproperty (
    id bigint not null,
    name varchar(255),
    primary key (id)
);
create table taskpropertyvalue (
    id bigint not null,
    value varchar(255),
    property_id bigint not null,
    tasktemplate_id bigint not null,
    primary key (id)
);
create table tasktemplate (
    id bigint not null,
    name varchar(255),
    parent_id bigint,
    primary key (id)
);

alter table node
    add constraint fk_3916o7fta2h8s2j0wyquumqub
    foreign key (tasktemplate_id)
    references tasktemplate;
alter table pptaccount
    add constraint fk_ah1kp16nv53avs0s61b0qfje2
    foreign key (ppt_id)
    references ppt;
alter table pptaccount
    add constraint fk_jpo3oot8ssbfu986lj40tefbh
    foreign key (user_id)
    references person;
alter table taskpropertyvalue
    add constraint fk_5rv22d7ar67c7y51v2fseaums
    foreign key (property_id)
    references taskproperty;
alter table taskpropertyvalue
    add constraint fk_qdojmdoqofuu3c1i05el8dhpq
    foreign key (tasktemplate_id)
    references tasktemplate;
alter table tasktemplate
    add constraint fk_2wtpsk3lq7w8v5y6ldc4pboar
    foreign key (parent_id)
    references tasktemplate;

create sequence ppt_seq;
create sequence pptaccount_seq;
create sequence taskproperty_seq;
create sequence taskpropertyvalue_seq;
create sequence tasktemplate_seq;
create sequence user_seq;

# --- !Downs

SET REFERENTIAL_INTEGRITY FALSE;

drop table if exists node;
drop table if exists person;
drop table if exists ppt;
drop table if exists pptaccount;
drop table if exists taskproperty;
drop table if exists taskpropertyvalue;
drop table if exists tasktemplate;

SET REFERENTIAL_INTEGRITY TRUE;

drop sequence ppt_seq;
drop sequence pptaccount_seq;
drop sequence taskproperty_seq;
drop sequence taskpropertyvalue_seq;
drop sequence tasktemplate_seq;
drop sequence user_seq;
