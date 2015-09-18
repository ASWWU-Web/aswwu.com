BEGIN TRANSACTION;

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS messages;

CREATE TABLE users (
	id UUID primary key,
	wwuid text,
	username text,
	fullname text,
	status text,
	roles text,
	auth_salt text,
	auth_time integer
);

CREATE TABLE profiles (
	id UUID primary key,
	user_id UUID,
	wwuid integer,
	username text,
	fullname text,
	photo text,
	gender text,
	birthday text,
	email text,
	phone text,
	website text,
	majors text,
	minors text,
	graduate text,
	preprofessional text,
	class_standing text,
	high_school text,
	class_of integer,
	relationship_status text,
	attached_to text,
	quote text,
	quote_author text,
	hobbies text,
	career_goals text,
	favorite_music text,
	favorite_movies text,
	favorite_books text,
	favorite_food text,
	pet_peeves text,
	personality text,
	views integer,
	privacy integer,
	department text,
	office text,
	office_hours text,
	updated_at integer,
	FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE messages (
	id UUID primary key,
	sender_id UUID,
	receiver_id UUID,
	message text,
	created_at timestamp default(strftime('%s', 'now')),
	FOREIGN KEY(sender_id) REFERENCES users(id),
	FOREIGN KEY(receiver_id) REFERENCES users(id)
);

COMMIT;
