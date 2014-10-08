# --- !Ups

create table person (
    id bigint not null,
    name varchar(255),
    password_hash varchar(255),
    salt binary(255),
    primary key (id)
);



create sequence user_seq;

# --- !Downs

SET REFERENTIAL_INTEGRITY FALSE;

drop table if exists person;

SET REFERENTIAL_INTEGRITY TRUE;

drop sequence user_seq;
