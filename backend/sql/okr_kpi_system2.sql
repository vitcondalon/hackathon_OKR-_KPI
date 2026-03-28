create table departments (
id serial primary key,
name varchar(255) not null,
create_at timestamp default current_timestamp

);
create table users (
id serial primary key,
full_name varchar(255) not null,
email varchar(255) unique not null,
password_hash text not null,
role varchar(50) check (role in ('Admin','Manager','Employee')),
department_id int,
created_at timestamp default current_timestamp,
constraint fk_department
	foreign key (department_id)
	references departments(id)
	on delete set null
	
);

create table cycles (
id serial primary key,
name varchar(255),
start_date Date,
end_date date,
created_at timestamp default current_timestamp
);

create table objective (
id serial primary key,
title text not null,
description text,
user_id int,
cycle_id int,
progress numeric (5,2) default 0,
created_at timestamp default current_timestamp,
foreign key (user_id) references users (id) on delete cascade,
foreign key (cycle_id) references cycles (id) on delete cascade
);

create table key_results (
id serial primary key,
objective_id int,
title text not null,
target_value numeric,
current_value numeric default 0,
created_at timestamp default current_timestamp, 
foreign key (objective_id) references objective (id) on delete cascade
);

create table checkins (
id serial primary key,
key_reult_id int,
value numeric,
note text,
created_at timestamp default current_timestamp,
foreign key (key_reult_id) references key_results (id) on delete cascade
);

create table audit_logs (
id serial primary key,
user_id int,
action varchar(255),
entity varchar(100),
entity_id int,
created_at timestamp default current_timestamp,
foreign key (user_id) references users (id) on delete set null
);





-- index toi uu 

create index idx_users_departments on users (department_id);
create index idx_objectives_users on objective (user_id);
create index idx_objectives_cycles on objective (cycle_id);
create index idx_key_results_objectives on key_results (objective_id);
create index idx_checkins_kr on checkins (key_reult_id);

-- query
-- tien do theo nhan su
select u.id, u.full_name, round(avg(o.progress),2) as avg_progress from users u 
left join objective o on u.id = o.user_id 
group by u.id, u.full_name;

--tien do theo phong ban 
select d.id, d.name, round(avg(o.progress),2) as department_progress from departments d
left join users u on d.id = u.department_id
left join objective o on u.id = o.user_id
group by d.id, d.name

--kpi completion rate 
select count(*) filter (where current_value	>= target_value)*100.0/count(*) as completion_rate 
from key_results

-- risk overview (KR chua dat <50%)
select 
	kr.id,
	kr.title,
	kr.current_value,
	kr.target_value,
	(kr.current_value / nullif(kr.target_value,0))*100 as progress_percent
	from key_results kr 
	where (kr.current_value / nullif(kr.target_value, 0))< 0.5;

-- top perform tot nhat 
select 
	u.full_name,
	round(avg(o.progress),2) as score
	from users u
	join objective o on u.id = o.user_id
	group by u.full_name 
	order by score desc 
	limit 5;
	