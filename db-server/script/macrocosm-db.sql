--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = off;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET escape_string_warning = off;


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: nwr_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE nwr_enum AS ENUM (
    'Node',
    'Way',
    'Relation'
);


--
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE user_role_enum AS ENUM (
    'administrator',
    'moderator'
);


--
-- Name: user_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE user_status_enum AS ENUM (
    'pending',
    'active',
    'confirmed',
    'suspended',
    'deleted'
);
--
-- Name: changeset_tags; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE changeset_tags (
    changeset_id bigint NOT NULL,
    k character varying(255) DEFAULT ''::character varying NOT NULL,
    v character varying(255) DEFAULT ''::character varying NOT NULL
);


--
-- Name: changesets; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE changesets (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    min_lat integer,
    max_lat integer,
    min_lon integer,
    max_lon integer,
    closed_at timestamp without time zone NOT NULL,
    num_changes integer DEFAULT 0 NOT NULL
);


--
-- Name: changesets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE changesets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: changesets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE changesets_id_seq OWNED BY changesets.id;


--
-- Name: current_node_tags; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE current_node_tags (
    node_id bigint NOT NULL,
    k character varying(255) DEFAULT ''::character varying NOT NULL,
    v character varying(255) DEFAULT ''::character varying NOT NULL
);


--
-- Name: current_nodes; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE current_nodes (
    id bigint NOT NULL,
    latitude integer NOT NULL,
    longitude integer NOT NULL,
    changeset_id bigint NOT NULL,
    visible boolean NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    tile bigint NOT NULL,
    version bigint NOT NULL
);


--
-- Name: current_nodes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE current_nodes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: current_nodes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE current_nodes_id_seq OWNED BY current_nodes.id;


--
-- Name: current_relation_members; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE current_relation_members (
    relation_id bigint NOT NULL,
    member_type nwr_enum NOT NULL,
    member_id bigint NOT NULL,
    member_role character varying(255) NOT NULL,
    sequence_id integer DEFAULT 0 NOT NULL
);


--
-- Name: current_relation_tags; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE current_relation_tags (
    relation_id bigint NOT NULL,
    k character varying(255) DEFAULT ''::character varying NOT NULL,
    v character varying(255) DEFAULT ''::character varying NOT NULL
);


--
-- Name: current_relations; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE current_relations (
    id bigint NOT NULL,
    changeset_id bigint NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    visible boolean NOT NULL,
    version bigint NOT NULL
);


--
-- Name: current_relations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE current_relations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: current_relations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE current_relations_id_seq OWNED BY current_relations.id;


--
-- Name: current_way_nodes; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE current_way_nodes (
    way_id bigint NOT NULL,
    node_id bigint NOT NULL,
    sequence_id bigint NOT NULL
);


--
-- Name: current_way_tags; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE current_way_tags (
    way_id bigint NOT NULL,
    k character varying(255) DEFAULT ''::character varying NOT NULL,
    v character varying(255) DEFAULT ''::character varying NOT NULL
);


--
-- Name: current_ways; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE current_ways (
    id bigint NOT NULL,
    changeset_id bigint NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    visible boolean NOT NULL,
    version bigint NOT NULL
);


--
-- Name: current_ways_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE current_ways_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: current_ways_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE current_ways_id_seq OWNED BY current_ways.id;

--
-- Name: node_tags; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE node_tags (
    node_id bigint NOT NULL,
    version bigint NOT NULL,
    k character varying(255) DEFAULT ''::character varying NOT NULL,
    v character varying(255) DEFAULT ''::character varying NOT NULL
);


--
-- Name: nodes; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE nodes (
    node_id bigint NOT NULL,
    latitude integer NOT NULL,
    longitude integer NOT NULL,
    changeset_id bigint NOT NULL,
    visible boolean NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    tile bigint NOT NULL,
    version bigint NOT NULL,
    redaction_id integer
);


--
-- Name: oauth_nonces; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE oauth_nonces (
    id integer NOT NULL,
    nonce character varying(255),
    "timestamp" integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: oauth_nonces_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE oauth_nonces_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: oauth_nonces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE oauth_nonces_id_seq OWNED BY oauth_nonces.id;


--
-- Name: oauth_tokens; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE oauth_tokens (
    id integer NOT NULL,
    user_id integer,
    type character varying(20),
    client_application_id integer,
    token character varying(50),
    secret character varying(50),
    authorized_at timestamp without time zone,
    invalidated_at timestamp without time zone,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    allow_read_prefs boolean DEFAULT false NOT NULL,
    allow_write_prefs boolean DEFAULT false NOT NULL,
    allow_write_diary boolean DEFAULT false NOT NULL,
    allow_write_api boolean DEFAULT false NOT NULL,
    allow_read_gpx boolean DEFAULT false NOT NULL,
    allow_write_gpx boolean DEFAULT false NOT NULL,
    callback_url character varying(255),
    verifier character varying(20)
);


--
-- Name: oauth_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE oauth_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: oauth_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE oauth_tokens_id_seq OWNED BY oauth_tokens.id;


--
-- Name: relation_members; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE relation_members (
    relation_id bigint DEFAULT 0 NOT NULL,
    member_type nwr_enum NOT NULL,
    member_id bigint NOT NULL,
    member_role character varying(255) NOT NULL,
    version bigint DEFAULT 0 NOT NULL,
    sequence_id integer DEFAULT 0 NOT NULL
);


--
-- Name: relation_tags; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE relation_tags (
    relation_id bigint DEFAULT 0 NOT NULL,
    k character varying(255) DEFAULT ''::character varying NOT NULL,
    v character varying(255) DEFAULT ''::character varying NOT NULL,
    version bigint NOT NULL
);


--
-- Name: relations; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE relations (
    relation_id bigint DEFAULT 0 NOT NULL,
    changeset_id bigint NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    version bigint NOT NULL,
    visible boolean DEFAULT true NOT NULL,
    redaction_id integer
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE sessions (
    id integer NOT NULL,
    session_id character varying(255),
    data text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE sessions_id_seq OWNED BY sessions.id;


--
-- Name: user_blocks; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE user_blocks (
    id integer NOT NULL,
    user_id bigint NOT NULL,
    creator_id bigint NOT NULL,
    reason text NOT NULL,
    ends_at timestamp without time zone NOT NULL,
    needs_view boolean DEFAULT false NOT NULL,
    revoker_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: user_blocks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE user_blocks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_blocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE user_blocks_id_seq OWNED BY user_blocks.id;


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE user_preferences (
    user_id bigint NOT NULL,
    k character varying(255) NOT NULL,
    v character varying(255) NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE user_roles (
    id integer NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    role user_role_enum NOT NULL,
    granter_id bigint NOT NULL
);


--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE user_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE user_roles_id_seq OWNED BY user_roles.id;


--
-- Name: user_tokens; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE user_tokens (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    token character varying(255) NOT NULL,
    expiry timestamp without time zone NOT NULL,
    referer text
);


--
-- Name: user_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE user_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE user_tokens_id_seq OWNED BY user_tokens.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE users (
    email character varying(255) NOT NULL,
    id bigint NOT NULL,
    pass_crypt character varying(255) NOT NULL,
    creation_time timestamp without time zone NOT NULL,
    display_name character varying(255) DEFAULT ''::character varying NOT NULL,
    data_public boolean DEFAULT false NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    home_lat double precision,
    home_lon double precision,
    home_zoom smallint DEFAULT 3,
    nearby integer DEFAULT 50,
    pass_salt character varying(255),
    image text,
    email_valid boolean DEFAULT false NOT NULL,
    new_email character varying(255),
    creation_ip character varying(255),
    languages character varying(255),
    status user_status_enum DEFAULT 'pending'::user_status_enum NOT NULL,
    terms_agreed timestamp without time zone,
    consider_pd boolean DEFAULT false NOT NULL,
    preferred_editor character varying(255),
    terms_seen boolean DEFAULT false NOT NULL,
    openid_url character varying(255)
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: way_nodes; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE way_nodes (
    way_id bigint NOT NULL,
    node_id bigint NOT NULL,
    version bigint NOT NULL,
    sequence_id bigint NOT NULL
);


--
-- Name: way_tags; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE way_tags (
    way_id bigint DEFAULT 0 NOT NULL,
    k character varying(255) NOT NULL,
    v character varying(255) NOT NULL,
    version bigint NOT NULL
);


--
-- Name: ways; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

CREATE TABLE ways (
    way_id bigint DEFAULT 0 NOT NULL,
    changeset_id bigint NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    version bigint NOT NULL,
    visible boolean DEFAULT true NOT NULL,
    redaction_id integer
);

--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE changesets ALTER COLUMN id SET DEFAULT nextval('changesets_id_seq'::regclass);

--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE current_nodes ALTER COLUMN id SET DEFAULT nextval('current_nodes_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE current_relations ALTER COLUMN id SET DEFAULT nextval('current_relations_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE current_ways ALTER COLUMN id SET DEFAULT nextval('current_ways_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE oauth_nonces ALTER COLUMN id SET DEFAULT nextval('oauth_nonces_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE oauth_tokens ALTER COLUMN id SET DEFAULT nextval('oauth_tokens_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE sessions ALTER COLUMN id SET DEFAULT nextval('sessions_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE user_blocks ALTER COLUMN id SET DEFAULT nextval('user_blocks_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE user_roles ALTER COLUMN id SET DEFAULT nextval('user_roles_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE user_tokens ALTER COLUMN id SET DEFAULT nextval('user_tokens_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Name: changesets_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY changesets
    ADD CONSTRAINT changesets_pkey PRIMARY KEY (id);


--
-- Name: current_node_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY current_node_tags
    ADD CONSTRAINT current_node_tags_pkey PRIMARY KEY (node_id, k);


--
-- Name: current_nodes_pkey1; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY current_nodes
    ADD CONSTRAINT current_nodes_pkey1 PRIMARY KEY (id);


--
-- Name: current_relation_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY current_relation_members
    ADD CONSTRAINT current_relation_members_pkey PRIMARY KEY (relation_id, member_type, member_id, member_role, sequence_id);


--
-- Name: current_relation_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY current_relation_tags
    ADD CONSTRAINT current_relation_tags_pkey PRIMARY KEY (relation_id, k);


--
-- Name: current_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY current_relations
    ADD CONSTRAINT current_relations_pkey PRIMARY KEY (id);


--
-- Name: current_way_nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY current_way_nodes
    ADD CONSTRAINT current_way_nodes_pkey PRIMARY KEY (way_id, sequence_id);


--
-- Name: current_way_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY current_way_tags
    ADD CONSTRAINT current_way_tags_pkey PRIMARY KEY (way_id, k);


--
-- Name: current_ways_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY current_ways
    ADD CONSTRAINT current_ways_pkey PRIMARY KEY (id);


--
-- Name: node_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY node_tags
    ADD CONSTRAINT node_tags_pkey PRIMARY KEY (node_id, version, k);


--
-- Name: nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY nodes
    ADD CONSTRAINT nodes_pkey PRIMARY KEY (node_id, version);


--
-- Name: oauth_nonces_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY oauth_nonces
    ADD CONSTRAINT oauth_nonces_pkey PRIMARY KEY (id);


--
-- Name: oauth_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY oauth_tokens
    ADD CONSTRAINT oauth_tokens_pkey PRIMARY KEY (id);


--
-- Name: relation_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY relation_members
    ADD CONSTRAINT relation_members_pkey PRIMARY KEY (relation_id, version, member_type, member_id, member_role, sequence_id);


--
-- Name: relation_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY relation_tags
    ADD CONSTRAINT relation_tags_pkey PRIMARY KEY (relation_id, version, k);


--
-- Name: relations_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY relations
    ADD CONSTRAINT relations_pkey PRIMARY KEY (relation_id, version);


--
-- Name: sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: user_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY user_blocks
    ADD CONSTRAINT user_blocks_pkey PRIMARY KEY (id);


--
-- Name: user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id, k);


--
-- Name: user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY user_tokens
    ADD CONSTRAINT user_tokens_pkey PRIMARY KEY (id);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: way_nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY way_nodes
    ADD CONSTRAINT way_nodes_pkey PRIMARY KEY (way_id, version, sequence_id);


--
-- Name: way_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY way_tags
    ADD CONSTRAINT way_tags_pkey PRIMARY KEY (way_id, version, k);


--
-- Name: ways_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace:
--

ALTER TABLE ONLY ways
    ADD CONSTRAINT ways_pkey PRIMARY KEY (way_id, version);

--
-- Name: changeset_tags_id_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX changeset_tags_id_idx ON changeset_tags USING btree (changeset_id);

--
-- NAME: btree_gist; Type: EXTENSION;
--

CREATE EXTENSION btree_gist;
--
-- Name: changesets_bbox_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX changesets_bbox_idx ON changesets USING gist (min_lat, max_lat, min_lon, max_lon);


--
-- Name: changesets_closed_at_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX changesets_closed_at_idx ON changesets USING btree (closed_at);


--
-- Name: changesets_created_at_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX changesets_created_at_idx ON changesets USING btree (created_at);


--
-- Name: changesets_user_id_created_at_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX changesets_user_id_created_at_idx ON changesets USING btree (user_id, created_at);


--
-- Name: changesets_user_id_id_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX changesets_user_id_id_idx ON changesets USING btree (user_id, id);

--
-- Name: current_nodes_tile_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX current_nodes_tile_idx ON current_nodes USING btree (tile);


--
-- Name: current_nodes_timestamp_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX current_nodes_timestamp_idx ON current_nodes USING btree ("timestamp");


--
-- Name: current_relation_members_member_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX current_relation_members_member_idx ON current_relation_members USING btree (member_type, member_id);


--
-- Name: current_relation_tags_id_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX current_relation_tags_id_idx ON current_relation_tags USING btree (relation_id);


--
-- Name: current_relation_tags_v_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX current_relation_tags_v_idx ON current_relation_tags USING btree (v);


--
-- Name: current_relations_timestamp_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX current_relations_timestamp_idx ON current_relations USING btree ("timestamp");


--
-- Name: current_way_nodes_node_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX current_way_nodes_node_idx ON current_way_nodes USING btree (node_id);


--
-- Name: current_way_tags_id_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX current_way_tags_id_idx ON current_way_tags USING btree (way_id);


--
-- Name: current_way_tags_v_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX current_way_tags_v_idx ON current_way_tags USING btree (v);


--
-- Name: current_ways_timestamp_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX current_ways_timestamp_idx ON current_ways USING btree ("timestamp");

--
-- Name: index_oauth_nonces_on_nonce_and_timestamp; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE UNIQUE INDEX index_oauth_nonces_on_nonce_and_timestamp ON oauth_nonces USING btree (nonce, "timestamp");


--
-- Name: index_oauth_tokens_on_token; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE UNIQUE INDEX index_oauth_tokens_on_token ON oauth_tokens USING btree (token);


--
-- Name: index_user_blocks_on_user_id; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX index_user_blocks_on_user_id ON user_blocks USING btree (user_id);


--
-- Name: nodes_changeset_id_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX nodes_changeset_id_idx ON nodes USING btree (changeset_id);


--
-- Name: nodes_tile_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX nodes_tile_idx ON nodes USING btree (tile);


--
-- Name: nodes_timestamp_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX nodes_timestamp_idx ON nodes USING btree ("timestamp");


--
-- Name: nodes_uid_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX nodes_uid_idx ON nodes USING btree (node_id);


--
-- Name: relation_members_member_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX relation_members_member_idx ON relation_members USING btree (member_type, member_id);


--
-- Name: relation_tags_id_version_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX relation_tags_id_version_idx ON relation_tags USING btree (relation_id, version);


--
-- Name: relations_changeset_id_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX relations_changeset_id_idx ON relations USING btree (changeset_id);


--
-- Name: relations_timestamp_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX relations_timestamp_idx ON relations USING btree ("timestamp");


--
-- Name: sessions_session_id_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE UNIQUE INDEX sessions_session_id_idx ON sessions USING btree (session_id);


--
-- Name: unique_schema_migrations; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE UNIQUE INDEX unique_schema_migrations ON schema_migrations USING btree (version);


--
-- Name: user_openid_url_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE UNIQUE INDEX user_openid_url_idx ON users USING btree (openid_url);


--
-- Name: user_roles_id_role_unique; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE UNIQUE INDEX user_roles_id_role_unique ON user_roles USING btree (user_id, role);


--
-- Name: user_tokens_token_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE UNIQUE INDEX user_tokens_token_idx ON user_tokens USING btree (token);


--
-- Name: user_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX user_tokens_user_id_idx ON user_tokens USING btree (user_id);


--
-- Name: users_display_name_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE UNIQUE INDEX users_display_name_idx ON users USING btree (display_name);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE UNIQUE INDEX users_email_idx ON users USING btree (email);


--
-- Name: way_nodes_node_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX way_nodes_node_idx ON way_nodes USING btree (node_id);


--
-- Name: way_tags_id_version_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX way_tags_id_version_idx ON way_tags USING btree (way_id, version);


--
-- Name: ways_changeset_id_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX ways_changeset_id_idx ON ways USING btree (changeset_id);


--
-- Name: ways_timestamp_idx; Type: INDEX; Schema: public; Owner: -; Tablespace:
--

CREATE INDEX ways_timestamp_idx ON ways USING btree ("timestamp");


--
-- Name: changeset_tags_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY changeset_tags
    ADD CONSTRAINT changeset_tags_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id);


--
-- Name: changesets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY changesets
    ADD CONSTRAINT changesets_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: current_node_tags_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY current_node_tags
    ADD CONSTRAINT current_node_tags_id_fkey FOREIGN KEY (node_id) REFERENCES current_nodes(id);


--
-- Name: current_nodes_changeset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY current_nodes
    ADD CONSTRAINT current_nodes_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id);


--
-- Name: current_relation_members_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY current_relation_members
    ADD CONSTRAINT current_relation_members_id_fkey FOREIGN KEY (relation_id) REFERENCES current_relations(id);


--
-- Name: current_relation_tags_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY current_relation_tags
    ADD CONSTRAINT current_relation_tags_id_fkey FOREIGN KEY (relation_id) REFERENCES current_relations(id);


--
-- Name: current_relations_changeset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY current_relations
    ADD CONSTRAINT current_relations_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id);


--
-- Name: current_way_nodes_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY current_way_nodes
    ADD CONSTRAINT current_way_nodes_id_fkey FOREIGN KEY (way_id) REFERENCES current_ways(id);


--
-- Name: current_way_nodes_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY current_way_nodes
    ADD CONSTRAINT current_way_nodes_node_id_fkey FOREIGN KEY (node_id) REFERENCES current_nodes(id);


--
-- Name: current_way_tags_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY current_way_tags
    ADD CONSTRAINT current_way_tags_id_fkey FOREIGN KEY (way_id) REFERENCES current_ways(id);


--
-- Name: current_ways_changeset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY current_ways
    ADD CONSTRAINT current_ways_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id);


--
-- Name: node_tags_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY node_tags
    ADD CONSTRAINT node_tags_id_fkey FOREIGN KEY (node_id, version) REFERENCES nodes(node_id, version);


--
-- Name: nodes_changeset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY nodes
    ADD CONSTRAINT nodes_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id);

--
-- Name: oauth_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY oauth_tokens
    ADD CONSTRAINT oauth_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: relation_members_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY relation_members
    ADD CONSTRAINT relation_members_id_fkey FOREIGN KEY (relation_id, version) REFERENCES relations(relation_id, version);


--
-- Name: relation_tags_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY relation_tags
    ADD CONSTRAINT relation_tags_id_fkey FOREIGN KEY (relation_id, version) REFERENCES relations(relation_id, version);


--
-- Name: relations_changeset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY relations
    ADD CONSTRAINT relations_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id);


--
-- Name: user_blocks_moderator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY user_blocks
    ADD CONSTRAINT user_blocks_moderator_id_fkey FOREIGN KEY (creator_id) REFERENCES users(id);


--
-- Name: user_blocks_revoker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY user_blocks
    ADD CONSTRAINT user_blocks_revoker_id_fkey FOREIGN KEY (revoker_id) REFERENCES users(id);


--
-- Name: user_blocks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY user_blocks
    ADD CONSTRAINT user_blocks_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: user_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY user_preferences
    ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: user_roles_granter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY user_roles
    ADD CONSTRAINT user_roles_granter_id_fkey FOREIGN KEY (granter_id) REFERENCES users(id);


--
-- Name: user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: user_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY user_tokens
    ADD CONSTRAINT user_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: way_nodes_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY way_nodes
    ADD CONSTRAINT way_nodes_id_fkey FOREIGN KEY (way_id, version) REFERENCES ways(way_id, version);


--
-- Name: way_tags_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY way_tags
    ADD CONSTRAINT way_tags_id_fkey FOREIGN KEY (way_id, version) REFERENCES ways(way_id, version);


--
-- Name: ways_changeset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY ways
    ADD CONSTRAINT ways_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id);


--
-- PostgreSQL database dump complete
--

INSERT INTO schema_migrations (version) VALUES ('1');

INSERT INTO schema_migrations (version) VALUES ('2');

INSERT INTO schema_migrations (version) VALUES ('3');

INSERT INTO schema_migrations (version) VALUES ('4');

INSERT INTO schema_migrations (version) VALUES ('5');

INSERT INTO schema_migrations (version) VALUES ('6');

INSERT INTO schema_migrations (version) VALUES ('7');

INSERT INTO schema_migrations (version) VALUES ('8');

INSERT INTO schema_migrations (version) VALUES ('9');

INSERT INTO schema_migrations (version) VALUES ('10');

INSERT INTO schema_migrations (version) VALUES ('11');

INSERT INTO schema_migrations (version) VALUES ('12');

INSERT INTO schema_migrations (version) VALUES ('13');

INSERT INTO schema_migrations (version) VALUES ('14');

INSERT INTO schema_migrations (version) VALUES ('15');

INSERT INTO schema_migrations (version) VALUES ('16');

INSERT INTO schema_migrations (version) VALUES ('17');

INSERT INTO schema_migrations (version) VALUES ('18');

INSERT INTO schema_migrations (version) VALUES ('19');

INSERT INTO schema_migrations (version) VALUES ('20');

INSERT INTO schema_migrations (version) VALUES ('21');

INSERT INTO schema_migrations (version) VALUES ('22');

INSERT INTO schema_migrations (version) VALUES ('23');

INSERT INTO schema_migrations (version) VALUES ('24');

INSERT INTO schema_migrations (version) VALUES ('25');

INSERT INTO schema_migrations (version) VALUES ('26');

INSERT INTO schema_migrations (version) VALUES ('27');

INSERT INTO schema_migrations (version) VALUES ('28');

INSERT INTO schema_migrations (version) VALUES ('29');

INSERT INTO schema_migrations (version) VALUES ('30');

INSERT INTO schema_migrations (version) VALUES ('31');

INSERT INTO schema_migrations (version) VALUES ('32');

INSERT INTO schema_migrations (version) VALUES ('33');

INSERT INTO schema_migrations (version) VALUES ('34');

INSERT INTO schema_migrations (version) VALUES ('35');

INSERT INTO schema_migrations (version) VALUES ('36');

INSERT INTO schema_migrations (version) VALUES ('37');

INSERT INTO schema_migrations (version) VALUES ('38');

INSERT INTO schema_migrations (version) VALUES ('39');

INSERT INTO schema_migrations (version) VALUES ('40');

INSERT INTO schema_migrations (version) VALUES ('41');

INSERT INTO schema_migrations (version) VALUES ('42');

INSERT INTO schema_migrations (version) VALUES ('43');

INSERT INTO schema_migrations (version) VALUES ('44');

INSERT INTO schema_migrations (version) VALUES ('45');

INSERT INTO schema_migrations (version) VALUES ('46');

INSERT INTO schema_migrations (version) VALUES ('47');

INSERT INTO schema_migrations (version) VALUES ('48');

INSERT INTO schema_migrations (version) VALUES ('49');

INSERT INTO schema_migrations (version) VALUES ('50');

INSERT INTO schema_migrations (version) VALUES ('51');

INSERT INTO schema_migrations (version) VALUES ('52');

INSERT INTO schema_migrations (version) VALUES ('20100513171259');

INSERT INTO schema_migrations (version) VALUES ('20100910084426');

INSERT INTO schema_migrations (version) VALUES ('20101114011429');

INSERT INTO schema_migrations (version) VALUES ('20110322001319');

INSERT INTO schema_migrations (version) VALUES ('20100516124737');

INSERT INTO schema_migrations (version) VALUES ('20110925112722');