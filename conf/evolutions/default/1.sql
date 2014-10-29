# --- !Ups

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

alter table pptaccount
    add constraint fk_ah1kp16nv53avs0s61b0qfje2
    foreign key (ppt_id)
    references ppt;
alter table pptaccount
    add constraint fk_jpo3oot8ssbfu986lj40tefbh
    foreign key (user_id)
    references person;

create sequence ppt_seq;
create sequence pptaccount_seq;
create sequence user_seq;

# --- !Downs

SET REFERENTIAL_INTEGRITY FALSE;

drop table if exists person;
drop table if exists ppt;
drop table if exists pptaccount;

SET REFERENTIAL_INTEGRITY TRUE;

drop sequence ppt_seq;
drop sequence pptaccount_seq;
drop sequence user_seq;
