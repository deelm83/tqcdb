--
-- PostgreSQL database dump
--

\restrict 06xeoatey2ADPHvLCk4VzwwZ5PCctxsNrRLhCUr4GWs9usdXSMvtY0COlpeofkr

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ArmyType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ArmyType" AS ENUM (
    'CAVALRY',
    'SHIELD',
    'ARCHER',
    'SPEAR',
    'SIEGE'
);


ALTER TYPE public."ArmyType" OWNER TO postgres;

--
-- Name: SuggestionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SuggestionStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED'
);


ALTER TYPE public."SuggestionStatus" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: edit_suggestions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.edit_suggestions (
    id text NOT NULL,
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    changes jsonb NOT NULL,
    reason text,
    status public."SuggestionStatus" DEFAULT 'PENDING'::public."SuggestionStatus" NOT NULL,
    user_id text NOT NULL,
    reviewed_by text,
    reviewed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.edit_suggestions OWNER TO postgres;

--
-- Name: formation_generals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.formation_generals (
    id text NOT NULL,
    formation_id text NOT NULL,
    general_id text NOT NULL,
    "position" integer NOT NULL,
    skill_1_id integer,
    skill_2_id integer
);


ALTER TABLE public.formation_generals OWNER TO postgres;

--
-- Name: formation_votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.formation_votes (
    id text NOT NULL,
    formation_id text NOT NULL,
    user_id text NOT NULL,
    value integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.formation_votes OWNER TO postgres;

--
-- Name: formations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.formations (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    army_type public."ArmyType" NOT NULL,
    user_id text,
    is_public boolean DEFAULT false NOT NULL,
    is_curated boolean DEFAULT false NOT NULL,
    rank_score integer DEFAULT 0 NOT NULL,
    vote_count integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.formations OWNER TO postgres;

--
-- Name: generals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.generals (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    faction_id text NOT NULL,
    cost integer NOT NULL,
    wiki_url text,
    image text,
    image_full text,
    tags text[],
    cavalry_grade text,
    shield_grade text,
    archer_grade text,
    spear_grade text,
    siege_grade text,
    innate_skill_id integer,
    inherited_skill_id integer,
    innate_skill_name text,
    inherited_skill_name text,
    status text DEFAULT 'needs_update'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    base_attack double precision,
    base_charm double precision,
    base_command double precision,
    base_intelligence double precision,
    base_politics double precision,
    base_speed double precision,
    growth_attack double precision,
    growth_charm double precision,
    growth_command double precision,
    growth_intelligence double precision,
    growth_politics double precision,
    growth_speed double precision,
    rarity text,
    ref_screenshot text
);


ALTER TABLE public.generals OWNER TO postgres;

--
-- Name: line_up_formations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.line_up_formations (
    id text NOT NULL,
    line_up_id text NOT NULL,
    formation_id text NOT NULL,
    "position" integer NOT NULL
);


ALTER TABLE public.line_up_formations OWNER TO postgres;

--
-- Name: line_up_skill_resolutions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.line_up_skill_resolutions (
    id text NOT NULL,
    line_up_id text NOT NULL,
    skill_id integer NOT NULL,
    resolved boolean DEFAULT true NOT NULL,
    note text
);


ALTER TABLE public.line_up_skill_resolutions OWNER TO postgres;

--
-- Name: line_ups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.line_ups (
    id text NOT NULL,
    name text NOT NULL,
    user_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.line_ups OWNER TO postgres;

--
-- Name: oauth_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.oauth_accounts (
    id text NOT NULL,
    provider text NOT NULL,
    provider_id text NOT NULL,
    access_token text,
    refresh_token text,
    user_id text NOT NULL
);


ALTER TABLE public.oauth_accounts OWNER TO postgres;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: skill_exchange_generals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skill_exchange_generals (
    id integer NOT NULL,
    skill_id integer NOT NULL,
    general_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.skill_exchange_generals OWNER TO postgres;

--
-- Name: skill_exchange_generals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.skill_exchange_generals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skill_exchange_generals_id_seq OWNER TO postgres;

--
-- Name: skill_exchange_generals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.skill_exchange_generals_id_seq OWNED BY public.skill_exchange_generals.id;


--
-- Name: skill_inherit_generals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skill_inherit_generals (
    id integer NOT NULL,
    skill_id integer NOT NULL,
    general_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.skill_inherit_generals OWNER TO postgres;

--
-- Name: skill_inherit_generals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.skill_inherit_generals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skill_inherit_generals_id_seq OWNER TO postgres;

--
-- Name: skill_inherit_generals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.skill_inherit_generals_id_seq OWNED BY public.skill_inherit_generals.id;


--
-- Name: skill_innate_generals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skill_innate_generals (
    id integer NOT NULL,
    skill_id integer NOT NULL,
    general_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.skill_innate_generals OWNER TO postgres;

--
-- Name: skill_innate_generals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.skill_innate_generals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skill_innate_generals_id_seq OWNER TO postgres;

--
-- Name: skill_innate_generals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.skill_innate_generals_id_seq OWNED BY public.skill_innate_generals.id;


--
-- Name: skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skills (
    id integer NOT NULL,
    slug text,
    name text NOT NULL,
    type_id text NOT NULL,
    type_name text,
    quality text,
    trigger_rate integer,
    source_type text,
    wiki_url text,
    effect text,
    target text,
    army_types text[],
    innate_to_generals text[],
    inheritance_from_generals text[],
    acquisition_type text,
    exchange_type text,
    exchange_generals text[],
    exchange_count integer,
    status text DEFAULT 'needs_update'::text NOT NULL,
    screenshots text[] DEFAULT ARRAY[]::text[],
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.skills OWNER TO postgres;

--
-- Name: skills_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skills_id_seq OWNER TO postgres;

--
-- Name: skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.skills_id_seq OWNED BY public.skills.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    display_name text NOT NULL,
    email text,
    avatar_url text,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: skill_exchange_generals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill_exchange_generals ALTER COLUMN id SET DEFAULT nextval('public.skill_exchange_generals_id_seq'::regclass);


--
-- Name: skill_inherit_generals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill_inherit_generals ALTER COLUMN id SET DEFAULT nextval('public.skill_inherit_generals_id_seq'::regclass);


--
-- Name: skill_innate_generals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill_innate_generals ALTER COLUMN id SET DEFAULT nextval('public.skill_innate_generals_id_seq'::regclass);


--
-- Name: skills id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills ALTER COLUMN id SET DEFAULT nextval('public.skills_id_seq'::regclass);


--
-- Data for Name: edit_suggestions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.edit_suggestions (id, entity_type, entity_id, changes, reason, status, user_id, reviewed_by, reviewed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: formation_generals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.formation_generals (id, formation_id, general_id, "position", skill_1_id, skill_2_id) FROM stdin;
\.


--
-- Data for Name: formation_votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.formation_votes (id, formation_id, user_id, value, created_at) FROM stdin;
\.


--
-- Data for Name: formations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.formations (id, name, description, army_type, user_id, is_public, is_curated, rank_score, vote_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: generals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.generals (id, slug, name, faction_id, cost, wiki_url, image, image_full, tags, cavalry_grade, shield_grade, archer_grade, spear_grade, siege_grade, innate_skill_id, inherited_skill_id, innate_skill_name, inherited_skill_name, status, created_at, updated_at, base_attack, base_charm, base_command, base_intelligence, base_politics, base_speed, growth_attack, growth_charm, growth_command, growth_intelligence, growth_politics, growth_speed, rarity, ref_screenshot) FROM stdin;
孙坚	ton-can	Tôn Càn	shu	3	\N	/images/generals/ton-kien.png	\N	{}	B	B	B	B	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 12:17:56.537	35.66	93.39	45.17	91.66	105.33	65.25	0.14	0.49	0.59	0.4	1.39	0.43	\N	ton-can.png
sp袁绍	sp-vien-thieu	SP Viên Thiệu	qun	7	\N	/images/generals/sp-vien-thieu.png	\N	{}	B	A	S	B	S	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 12:17:56.533	108.14	109.95	119.19	88.39	109.33	81.76	2.06	1.05	2.01	0.81	2.07	1.04	SP	sp-vien-thieu.png
sp黄月英	sp-hoang-nguyet-anh	SP Hoàng Nguyệt Anh	qun	3	\N	/images/generals/sp-hoang-nguyet-anh.png	\N	{}	\N	\N	\N	\N	\N	259	96	Huệ Chất Lan Tâm	Công Bất Đường Quyên	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:43:21.954	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
黄盖	hoang-cai	Hoàng Cái	wu	5	\N	/images/generals/hoang-cai.png	\N	{}	B	A	S	A	B	249	\N	Khỏ Nhục Kế	\N	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:53:51.239	109.79	94.87	111.92	70.89	\N	41.26	1.41	0.73	1.68	0.31	\N	0.54	\N	hoang-cai.png
华歆	hoa-ham	Hoa Hâm	wei	3	\N	/images/generals/hoa-ham.png	\N	{}	C	C	C	B	C	155	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	44.97	26.63	46.03	99.8	\N	48.23	0.63	0.51	0.69	0.88	\N	0.85	\N	hoa-ham.png
祝融	chuc-dung	Chúc Dung	qun	6	\N	/images/generals/chuc-dung.png	\N	{}	S	A	A	A	C	236	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	128.89	88.63	93.76	29.13	\N	75.92	2.31	0.77	1.04	0.27	\N	0.68	SR	chuc-dung.png
甄姬	chan-co	Chân Cơ	wei	6	\N	/images/generals/chan-co.png	\N	{}	C	C	B	C	C	431	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 12:18:14.007	9.89	144.54	51.53	89.18	\N	92.33	0.31	2.66	0.87	1.22	\N	1.07	\N	chan-co.png
夏侯淵	ha-hau-uyen	Hạ Hầu Uyên	qun	3	\N	/images/generals/ha-tien.png	\N	{}	\N	\N	\N	\N	\N	433	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 12:24:18.129	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
贾诩	gia-hu	Giả Hu	wei	7	https://wiki.biligame.com/sgzzlb/%E8%B4%BE%E8%AF%A9	/images/generals/2_gia_hu.jpg	\N	{"Khống [ ] Mưu"}	S	A	S	C	A	\N	\N	神机莫测	伪书相间	needs_update	2026-01-18 14:24:22.963	2026-01-18 14:24:22.963	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
张郃	truong	Trương [郃]	wei	6	https://wiki.biligame.com/sgzzlb/%E5%BC%A0%E9%83%83	/images/generals/11_truong.jpg	\N	{Võ}	A	S	B	S	A	\N	\N	大戟士	大戟士	needs_update	2026-01-18 14:24:22.968	2026-01-18 14:24:22.968	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
郝昭		[郝] [昭]	wei	6	https://wiki.biligame.com/sgzzlb/%E9%83%9D%E6%98%AD	\N	\N	{"[医] [ ] [兼]"}	B	S	A	B	S	\N	\N	金城汤池	横戈跃马	needs_update	2026-01-18 14:24:22.97	2026-01-18 14:24:22.97	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
曹纯	tao	Tào [纯]	wei	5	https://wiki.biligame.com/sgzzlb/%E6%9B%B9%E7%BA%AF	/images/generals/25_tao.jpg	\N	{Võ}	S	C	B	B	C	\N	\N	虎豹骑	虎豹骑	needs_update	2026-01-18 14:24:22.974	2026-01-18 14:24:22.974	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
郭嘉	quach-gia	Quách Gia	wei	5	https://wiki.biligame.com/sgzzlb/%E9%83%AD%E5%98%89	/images/generals/30_quach_gia.jpg	\N	{[辅]}	S	A	A	B	B	\N	\N	十胜十败	沉沙决水	needs_update	2026-01-18 14:24:22.977	2026-01-18 14:24:22.977	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
关银屏	quan-ngan	Quan Ngân [屏]	shu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%85%B3%E9%93%B6%E5%B1%8F&action=edit&redlink=1	\N	\N	{"Chiến [ ] Khống"}	S	B	C	S	C	\N	\N	将门虎女	箕形阵	needs_update	2026-01-18 14:24:22.98	2026-01-18 14:24:22.98	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
蒋琬	tuong-uyen	Tưởng Uyển	shu	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E8%92%8B%E7%90%AC&action=edit&redlink=1	/images/generals/50_tuong_uyen.jpg	\N	{Chánh}	B	C	S	C	S	\N	64	克遵画一	Kê Hay Mưu Giới	needs_update	2026-01-18 14:24:22.983	2026-01-21 07:50:02.475	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
马云禄	ma-van	Mã Vân [禄]	shu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%A9%AC%E4%BA%91%E7%A6%84&action=edit&redlink=1	/images/generals/43_ma_van.jpg	\N	{Võ}	S	C	B	A	C	\N	\N	鸱苕英姿	乘敌不虞	needs_update	2026-01-18 14:24:22.981	2026-01-18 14:24:22.981	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
陈到	tran	Trần [到]	shu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%99%88%E5%88%B0&action=edit&redlink=1	/images/generals/44_tran.jpg	\N	{Chiến}	C	B	B	S	B	\N	\N	白毦兵	白毦兵	needs_update	2026-01-18 14:24:22.982	2026-01-18 14:24:22.982	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
徐庶	tu	Từ [庶]	shu	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%BE%90%E5%BA%B6&action=edit&redlink=1	/images/generals/52_tu.jpg	\N	{Mưu}	S	B	A	B	B	\N	\N	处兹不惑	暂避其锋	needs_update	2026-01-18 14:24:22.985	2026-01-18 14:24:22.985	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
王朗	vuong-lang	Vương Lãng	wei	4	\N	/images/generals/vuong-lang.png	\N	{}	A	B	B	C	C	20	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	42.22	64.3	56.5	104.94	116.81	85.63	0.38	0.7	0.5	1.26	1.99	0.77	\N	vuong-lang.png
张纮	truong-2	Trương [纮]	wu	7	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%BC%A0%E7%BA%AE&action=edit&redlink=1	/images/generals/11_truong.jpg	\N	{Chánh}	C	C	B	C	A	\N	\N	奇施经略	智计	needs_update	2026-01-18 14:24:22.989	2026-01-18 14:24:22.989	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
马良	ma-luong	Mã Lương	shu	4	\N	/images/generals/ma-luong.png	\N	{}	C	A	A	C	B	146	146	\N	Bạch Mi	needs_update	2026-01-18 06:41:42.425	2026-01-21 03:56:56.876	31.55	106.71	73.71	117.36	\N	64.26	0.45	1.09	1.09	1.44	\N	0.54	\N	ma-luong.png
庞统	bang-thong	Bàng Thống	shu	7	https://wiki.biligame.com/sgzzlb/%E5%BA%9E%E7%BB%9F	/images/generals/34_bang_thong.jpg	\N	{Mưu}	C	B	S	A	B	\N	35	连环计	乘敌不虞	complete	2026-01-18 14:24:22.978	2026-01-18 16:17:13.723	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
张辽	truong-lieu	Trương Liêu	wei	7	https://wiki.biligame.com/sgzzlb/%E5%BC%A0%E8%BE%BD	/images/generals/5_truong_lieu.jpg	\N	{Võ}	S	A	B	S	B	\N	48	陷阵突袭	Dũng Giả Hàng Đầu	needs_update	2026-01-18 14:24:22.966	2026-01-21 07:25:02.987	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
孙尚香	ton-thuong-huong	Tôn Thượng Hương	wu	7	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%AD%99%E5%B0%9A%E9%A6%99&action=edit&redlink=1	/images/generals/58_ton_thuong_huong.jpg	\N	{Võ}	S	B	S	A	C	437	70	Cung Yêu Cơ	Liên Minh	complete	2026-01-18 14:24:22.987	2026-01-18 18:53:17.075	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
张姬	truong-co	Trương Cơ	shu	4	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%BC%A0%E5%A7%AC&action=edit&redlink=1	/images/generals/53_truong_co.jpg	\N	{Võ}	A	B	B	S	C	\N	48	奋矛英姿	Dũng Giả Hàng Đầu	needs_update	2026-01-18 14:24:22.986	2026-01-21 07:25:02.989	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
司马懿	tu-ma-y	Tư Mã Ý	wei	7	https://wiki.biligame.com/sgzzlb/%E5%8F%B8%E9%A9%AC%E6%87%BF	/images/generals/3_tu_ma_y.jpg	\N	{Mưu}	A	S	A	S	A	429	60	鹰视狼顾	Dụng Võ Thần Thông	complete	2026-01-18 14:24:22.964	2026-01-21 07:26:19.707	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
My Trúc	my-truc	My Trúc	qun	3	\N	/images/generals/my-truc.png	\N	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 06:41:42.425	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
周泰	chu	Chu [泰]	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%91%A8%E6%B3%B0&action=edit&redlink=1	/images/generals/67_chu.jpg	\N	{Thuẫn}	S	S	A	A	C	\N	\N	肉身铁壁	一力拒守	needs_update	2026-01-18 14:24:22.994	2026-01-18 14:24:22.994	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
費詩	phi-thi	Phí Thi	shu	3	\N	/images/generals/phi-thi.png	\N	{}	C	B	C	B	B	166	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	33.59	82.3	41.14	79.19	75.37	61.56	0.29	0.86	1.22	0.27	0.55	0.92	\N	phi-thi.png
陈宫	tran-cung	Trần Cung	qun	4	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%99%88%E5%AE%AB&action=edit&redlink=1	/images/generals/110_tran_cung.jpg	\N	{Mưu}	A	B	S	A	A	\N	\N	百计多谋	智计	needs_update	2026-01-18 14:24:23.013	2026-01-18 14:24:23.013	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
蔡邕	thai	Thái [邕]	qun	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E8%94%A1%E9%82%95&action=edit&redlink=1	\N	\N	{Chánh}	C	C	B	C	C	\N	\N	晓知良木	经术政要	needs_update	2026-01-18 14:24:22.999	2026-01-18 14:24:22.999	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
吕玲绮	lu-linh	Lữ Linh [绮]	qun	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%90%95%E7%8E%B2%E7%BB%AE&action=edit&redlink=1	\N	\N	{Võ}	S	B	S	A	C	\N	\N	狮子奋迅	绝地反击	needs_update	2026-01-18 14:24:23.005	2026-01-18 14:24:23.005	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
高览	cao	Cao [览]	qun	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%AB%98%E8%A7%88&action=edit&redlink=1	/images/generals/99_cao.jpg	\N	{Chiến}	A	A	B	S	C	\N	\N	乘胜长驱	振军击营	needs_update	2026-01-18 14:24:23.007	2026-01-18 14:24:23.007	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
木鹿大王	moc-dai-vuong	Mộc [鹿] Đại Vương	qun	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E6%9C%A8%E9%B9%BF%E5%A4%A7%E7%8E%8B&action=edit&redlink=1	/images/generals/100_moc_dai_vuong.jpg	\N	{"[蛮] [ ] Chiến"}	S	C	C	A	C	\N	\N	象兵	象兵	needs_update	2026-01-18 14:24:23.008	2026-01-18 14:24:23.008	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
马腾	ma	Mã [腾]	qun	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%A9%AC%E8%85%BE&action=edit&redlink=1	/images/generals/103_ma.jpg	\N	{Chiến}	S	C	B	C	C	\N	\N	西凉铁骑	西凉铁骑	needs_update	2026-01-18 14:24:23.01	2026-01-18 14:24:23.01	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
文丑	van-suu	Văn Sửu	qun	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E6%96%87%E4%B8%91&action=edit&redlink=1	/images/generals/104_van_suu.jpg	\N	{"Chiến [ ] Khống"}	A	A	S	A	C	\N	\N	登锋陷阵	破阵催坚	needs_update	2026-01-18 14:24:23.011	2026-01-18 14:24:23.011	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
呂玲綺	lu-linh-y	Lữ Linh Ỷ	qun	6	\N	/images/generals/lu-linh-y.png	\N	{}	S	B	S	A	C	235	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	133.22	45.21	104.08	21.42	\N	79.38	2.38	0.59	1.32	0.18	\N	1.02	\N	lu-linh-y.png
司马徵	tu-ma	Tư Mã [徵]	qun	4	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%8F%B8%E9%A9%AC%E5%BE%B5&action=edit&redlink=1	\N	\N	{[魅]}	C	C	B	C	C	\N	\N	水镜先生	诱敌深入	needs_update	2026-01-18 14:24:23.014	2026-01-18 14:24:23.014	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
马均	ma-quan	Mã Quân	wei	6	\N	/images/generals/ma-quan.png	\N	{}	C	C	C	C	S	192	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	23.08	120.09	41.19	85.46	\N	53.81	0.32	2.11	1.01	1.34	\N	0.99	\N	ma-quan.png
马忠	ma-trung	Mã Trung	wu	6	\N	/images/generals/ma-trung.png	\N	{}	C	A	S	A	A	216	\N	Ám Tiễn Nan Phòng	\N	needs_update	2026-01-18 06:41:42.425	2026-01-21 04:25:52.22	113.63	50.69	94.55	43.98	\N	107.93	1.77	0.51	1.45	0.42	\N	1.47	\N	ma-trung.png
法正	phap-chinh	Pháp Chính	shu	4	\N	/images/generals/phap-chinh.png	\N	{}	B	S	A	A	A	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 12:17:56.521	53.08	69.63	101.19	93.2	\N	83.92	0.32	0.77	1.01	0.8	\N	0.68	\N	phap-chinh.png
祝融夫人	chuc-dung-phu-nhan	Chúc Dung Phu Nhân	qun	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E7%A5%9D%E8%9E%8D%E5%A4%AB%E4%BA%BA&action=edit&redlink=1	/images/generals/93_chuc_dung_phu_nhan.jpg	\N	{"[蛮] [ ] Võ [ ] [医]"}	S	A	A	A	C	236	52	Hỏa Thần Anh Phong	Binh Vô Thường Thế	complete	2026-01-18 14:24:23.006	2026-01-21 07:40:45.967	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
凌统	lang-thong	Lăng Thống	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%87%8C%E7%BB%9F&action=edit&redlink=1	/images/generals/63_lang_thong.jpg	\N	{"[辅] [ ] Võ"}	S	B	C	A	C	\N	43	国士将风	Hoành Qua Dược Mã	needs_update	2026-01-18 14:24:22.99	2026-01-21 07:41:48.659	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
高顺	cao-thuan-2	Cao Thuận	qun	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%AB%98%E9%A1%BA&action=edit&redlink=1	/images/generals/102_cao_thuan.jpg	\N	{Thuẫn}	C	S	B	C	S	\N	54	陷阵营	Hãm Trận Doanh	needs_update	2026-01-18 14:25:13.941	2026-01-21 07:37:03.268	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
陈群	tran-quan-2	Trần Quần	wei	6	https://wiki.biligame.com/sgzzlb/%E9%99%88%E7%BE%A4	/images/generals/8_tran_quan.jpg	\N	{Chánh}	C	B	B	C	C	\N	\N	清流雅望	挫锐	needs_update	2026-01-18 14:25:13.92	2026-01-18 14:25:13.92	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
曹洪	tao-hong	Tào Hồng	wei	5	\N	/images/generals/tao-hong.png	\N	{}	B	B	A	A	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	109.5	64.45	109.4	42.98	58.25	64.72	1.5	0.55	1.6	0.42	0.75	0.88	\N	tao-hong.png
程昱	trinh-duc-2	Trình Dục	wei	6	https://wiki.biligame.com/sgzzlb/%E7%A8%8B%E6%98%B1	/images/generals/15_trinh_duc.jpg	\N	{Mưu}	S	C	A	C	A	\N	\N	十面埋伏	守而必固	needs_update	2026-01-18 14:25:13.921	2026-01-18 14:25:13.921	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
荀攸	tuan-du-2	Tuân Du	wei	6	https://wiki.biligame.com/sgzzlb/%E8%8D%80%E6%94%B8	/images/generals/17_tuan_du.jpg	\N	{"Mưu [ ] [辅]"}	S	B	S	C	B	\N	\N	十二奇谋	运筹决算	needs_update	2026-01-18 14:25:13.925	2026-01-18 14:25:13.925	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
乐进	nhac-tien-2	Nhạc Tiến	wei	5	https://wiki.biligame.com/sgzzlb/%E4%B9%90%E8%BF%9B	/images/generals/27_nhac_tien.jpg	\N	{Võ}	S	A	B	S	S	\N	\N	临战先登	锋矢阵	needs_update	2026-01-18 14:25:13.927	2026-01-18 14:25:13.927	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
夏侯渊	ha-hau-uyen-2	Hạ Hầu Uyên	wei	5	https://wiki.biligame.com/sgzzlb/%E5%A4%8F%E4%BE%AF%E6%B8%8A	/images/generals/29_ha_hau_uyen.jpg	\N	{Võ}	S	B	S	B	A	\N	\N	将行其疾	万箭齐发	needs_update	2026-01-18 14:25:13.928	2026-01-18 14:25:13.928	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
曹休	tao-huu	Tào Hưu	wei	4	\N	/images/generals/tao-huu.png	\N	{}	B	B	B	B	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	98.41	68.9	85.7	57.9	72.91	77.3	1.23	0.1	0.62	0.1	0.57	0.7	\N	tao-huu.png
甘宁	cam-ninh-2	Cam Ninh	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E7%94%98%E5%AE%81&action=edit&redlink=1	/images/generals/66_cam_ninh.jpg	\N	{Võ}	A	A	S	S	S	218	36	Cẩm Phàm Bách Linh	Bách Kỵ Kiếp Doanh	needs_update	2026-01-18 14:25:13.932	2026-01-21 04:26:45.511	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
关兴	quan-hung-2	Quan Hưng	shu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%85%B3%E5%85%B4&action=edit&redlink=1	\N	\N	{Chiến}	A	A	B	S	C	\N	\N	刀出如霆	士争先赴	needs_update	2026-01-18 14:25:13.929	2026-01-18 14:25:13.929	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
孙权	ton-quyen-2	Tôn Quyền	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%AD%99%E6%9D%83&action=edit&redlink=1	/images/generals/65_ton_quyen.jpg	\N	{Chiến}	S	B	S	A	C	\N	\N	坐断东南	卧薪尝胆	needs_update	2026-01-18 14:25:13.93	2026-01-18 14:25:13.93	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
袁术	vien-thuat-2	Viên Thuật	qun	7	https://wiki.biligame.com/sgzzlb/index.php?title=%E8%A2%81%E6%9C%AF&action=edit&redlink=1	/images/generals/82_vien_thuat.jpg	\N	{[兼]}	S	B	S	B	C	\N	\N	符命自立	形机军略	needs_update	2026-01-18 14:25:13.934	2026-01-18 14:25:13.934	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
吕布	lu-bo-2	Lữ Bố	qun	7	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%90%95%E5%B8%83&action=edit&redlink=1	/images/generals/86_lu_bo.jpg	\N	{Võ}	S	B	S	A	C	\N	\N	天下无双	一骑当千	needs_update	2026-01-18 14:25:13.936	2026-01-18 14:25:13.936	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
田丰	dien-phong-2	Điền Phong	qun	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E7%94%B0%E4%B8%B0&action=edit&redlink=1	/images/generals/91_dien_phong.jpg	\N	{"Khống [ ] [辅]"}	A	S	B	A	A	\N	\N	竭忠尽智	兵无常势	needs_update	2026-01-18 14:25:13.94	2026-01-18 14:25:13.94	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
邹氏	trau-thi-2	Trâu Thị	qun	3	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%82%B9%E6%B0%8F&action=edit&redlink=1	\N	\N	{Khống}	C	B	C	C	C	\N	\N	顾盼生姿	先成其虑	needs_update	2026-01-18 14:25:13.944	2026-01-18 14:25:13.944	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
荀彧	tuan-du	Tuân Úc	qun	3	\N	/images/generals/16_tuan_uc.jpg	\N	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 12:17:56.523	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
典韦	dien-vi-2	Điển Vi	wei	7	https://wiki.biligame.com/sgzzlb/%E5%85%B8%E9%9F%A6	/images/generals/1_dien_vi.jpg	\N	{"Thuẫn [ ] Võ"}	B	S	C	A	C	\N	\N	古之恶来	\N	needs_update	2026-01-18 14:25:13.916	2026-01-21 07:10:39.542	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
张飞	truong-phi	Trương Phi	shu	6	\N	/images/generals/truong-phi.png	\N	{}	A	S	C	S	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:09:22.199	149.11	51.46	126.11	25.8	\N	34.18	2.69	0.34	1.69	0.2	\N	0.22	\N	truong-phi.png
多思大王	doa-tu-dai-vuong	Đóa Tư Đại Vương	qun	6	\N	/images/generals/doa-tu-dai-vuong.png	\N	{}	S	S	A	C	C	231	\N	Độc Tuyền Cự Thục	\N	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:20:30.814	79.9	79.49	96.96	70.91	\N	107.62	1.1	0.71	1.84	0.89	\N	1.98	S	doa-tu-dai-vuong.png
庞德	bang-duc	Bàng Đức	wei	6	https://wiki.biligame.com/sgzzlb/%E5%BA%9E%E5%BE%B7	/images/generals/20_bang_duc.jpg	\N	{Võ}	A	B	S	B	B	\N	\N	抬棺决战	暂避其锋	needs_update	2026-01-18 14:26:47.567	2026-01-18 14:26:47.567	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
吕蒙	lu	Lữ [蒙]	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%90%95%E8%92%99&action=edit&redlink=1	/images/generals/68_lu.jpg	\N	{"Khống [ ] [兼]"}	B	B	A	S	S	\N	\N	白衣渡江	士别三日	needs_update	2026-01-18 14:26:47.573	2026-01-18 14:26:47.573	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
周瑜	chu-du	Chu Du	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%91%A8%E7%91%9C&action=edit&redlink=1	/images/generals/72_chu_du.jpg	\N	{Mưu}	B	A	S	A	C	\N	\N	神火计	风助火势	needs_update	2026-01-18 14:26:47.575	2026-01-18 14:26:47.575	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
鲁肃	lo-truc	Lô Trực	qun	5	\N	/images/generals/lo-truc.png	\N	{}	B	C	A	B	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 12:17:56.525	84.09	100.57	108.61	118.44	\N	77.87	1.11	1.03	1.19	1.76	\N	0.73	\N	lo-truc.png
诸葛亮	gia-cat-luong	Gia Cát Lượng	shu	7	https://wiki.biligame.com/sgzzlb/%E8%AF%B8%E8%91%9B%E4%BA%AE	/images/generals/36_gia_cat_luong.jpg	\N	{"Khống [ ] Mưu"}	C	B	S	S	S	434	435	神机妙算	Nhà Nho Đầu Khấu	complete	2026-01-18 14:26:47.569	2026-01-18 16:59:33.238	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
关羽	quan-vu	Quan Vũ	shu	7	https://wiki.biligame.com/sgzzlb/%E5%85%B3%E7%BE%BD	/images/generals/quan-vu.png	\N	{"Chiến [ ] Khống"}	S	A	C	S	C	177	59	威震华夏	Hoành Tảo Thiên Quân	complete	2026-01-18 14:26:47.57	2026-01-21 07:42:09.403	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
廖化	lieu-hoa	Liêu Hóa	shu	5	\N	/images/generals/lieu-hoa.png	\N	{}	B	A	C	A	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	99.75	74.93	108.15	58.69	\N	39.46	1.25	0.47	1.85	0.51	\N	0.34	\N	lieu-hoa.png
Đinh Nguyên	dinh-nguyen	Đinh Nguyên	qun	3	\N	/images/generals/dinh-nguyen.png	\N	{}	C	C	B	C	A	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	96.22	77.7	75.05	48.15	\N	33.32	1.06	0.2	0.27	0.43	\N	0.28	\N	dinh-nguyen.png
华佗	hoa-da	Hoa Đà	qun	5	\N	/images/generals/hoa-da.png	\N	{}	C	C	C	C	C	256	71	\N	Cắt Xương Trị Độc	needs_update	2026-01-18 06:41:42.425	2026-01-21 04:27:24.723	19.22	101.75	51.44	85.3	\N	121.38	0.38	1.25	1.76	0.7	\N	2.02	\N	hoa-da.png
袁绍	vien-thieu	Viên Thiệu	qun	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E8%A2%81%E7%BB%8D&action=edit&redlink=1	/images/generals/96_vien_thieu.jpg	\N	{Chiến}	B	A	S	B	S	\N	38	累世立名	Hợp Quân Tụ Chúng	needs_update	2026-01-18 14:26:47.577	2026-01-21 07:42:42.154	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
董昭	dong-chieu	Đổng Chiêu	wei	3	\N	/images/generals/dong-chieu.png	\N	{}	C	C	B	B	B	164	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	31.38	67.64	53.68	96.08	88.51	49.03	0.34	0.46	1.04	0.74	0.45	0.69	\N	dong-chieu.png
邓芝	dang-chi	Đặng Chí	shu	3	\N	/images/generals/dang-chi.png	\N	{}	C	C	C	B	A	161	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	65.57	101.83	78.85	94.14	103.61	57.51	0.71	0.73	0.31	0.48	1.19	0.45	\N	dang-chi.png
文醜	van-sinh	Văn Sính	wei	5	\N	/images/generals/van-sinh.png	\N	{}	C	S	B	A	B	145	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	116.39	82.07	99.95	86.1	\N	35.77	1.81	0.53	1.05	0.9	\N	0.83	\N	van-sinh.png
Gia Cát Khác	gia-cat-khac	Gia Cát Khác	wu	4	\N	/images/generals/gia-cat-khac.png	\N	{}	C	C	A	S	A	262	\N	Huy Binh Mưu Thắng	\N	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:45:23.721	52.51	24.44	94.61	97.48	\N	20.07	0.29	0.76	1.19	0.92	\N	0.53	\N	gia-cat-khac.png
郑育	trinh-duc	Trình Dục	wei	6	\N	/images/generals/trinh-duc.png	\N	{}	S	C	A	C	A	198	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	56.79	55.21	95.84	103.7	\N	134.08	0.41	0.59	1.36	1.3	\N	2.32	\N	trinh-duc.png
劉巴	luu-ba	Lưu Ba	shu	3	\N	/images/generals/luu-ba.png	\N	{}	C	C	C	C	C	165	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	49.4	65.89	43.38	96.07	94.95	49.02	1.44	0.47	0.78	0.79	1.05	0.9	\N	luu-ba.png
吴懿	ngo-y	Ngô Ý	shu	4	\N	/images/generals/ngo-y.png	\N	{}	C	B	C	C	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	91.62	78.9	96.02	71.9	\N	59.78	0.98	0.1	0.9	0.1	\N	0.46	\N	ngo-y.png
宗憲	tong-hien	Tống Hiến	qun	4	\N	/images/generals/tong-hien.png	\N	{}	C	C	A	C	C	167	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	100.67	32.9	73.85	28.9	\N	35.38	1.25	0.1	0.31	0.1	\N	0.34	\N	tong-hien.png
许攸	hua-du	Hứa Du	qun	6	\N	/images/generals/hua-du.png	\N	{}	A	A	A	A	C	229	85	\N	Kế Hoạch Quyết Đoán	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:50:44.09	23.28	30.22	72.86	69.49	118.19	61.48	0.12	0.38	1.94	0.71	2.01	0.92	\N	hua-du.png
袁術	vien-thuat	Viên Thuật	qun	6	\N	/images/generals/vien-thuat.png	\N	{}	S	B	S	B	C	233	78	\N	Hình Cơ Quân Lược	complete	2026-01-18 06:41:42.425	2026-01-21 07:38:05.505	102.24	43.56	78.58	18.09	\N	84.23	1.96	0.24	1.82	0.11	\N	1.17	\N	vien-thuat.png
Văn Xú	van-xu	Văn Xú	qun	5	\N	/images/generals/van-xu.png	\N	{}	A	A	S	A	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	131.38	56.43	113.7	43.31	\N	60.49	2.02	0.97	1.3	0.49	\N	0.71	\N	van-xu.png
曹丕	tao-phi	Tào Phi	wei	4	\N	/images/generals/tao-phi.png	\N	{}	A	A	S	C	C	258	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	88.48	101.95	95.46	131.6	\N	75.76	0.92	1.05	1.34	2.4	\N	1.04	\N	tao-phi.png
刘度	luu-do	Lưu Do	qun	3	\N	/images/generals/luu-do.png	\N	{}	C	C	C	B	C	157	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	83.76	71.9	81.15	84.57	\N	49.82	0.88	0.42	1.01	0.77	\N	0.94	\N	luu-do.png
夏侯恩	ha-hau-an	Hạ Hầu Ân	wei	4	\N	/images/generals/ha-hau-an.png	\N	{}	B	C	B	C	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	89.29	60.84	80.29	46.9	\N	60.98	0.91	0.52	0.91	0.1	\N	0.42	\N	ha-hau-an.png
刘禅	luu-thien	Lưu Thiện	shu	3	\N	/images/generals/luu-thien.png	\N	{}	B	C	C	B	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	6.33	78.48	3.8	4.25	\N	63.63	0.07	1.18	0.04	0.01	\N	0.77	\N	luu-thien.png
子思	tu-thu	Tử Thứ	shu	5	\N	/images/generals/tu-thu.png	\N	{}	S	B	A	B	B	248	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	69.7	100.95	111.51	95.01	\N	57.69	0.3	1.05	1.29	0.79	\N	0.51	\N	tu-thu.png
毛玠	mao-gioi	Mao Giới	wei	3	\N	/images/generals/mao-gioi.png	\N	{}	C	C	C	C	C	162	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	54.16	76.81	76.57	86.15	78.89	49.56	0.8	0.83	0.71	0.43	0.99	0.92	\N	mao-gioi.png
郭淮	quach-hoai	Quách Hoài	wei	4	\N	/images/generals/quach-hoai.png	\N	{}	C	S	B	A	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	95.67	85.74	116.07	84.69	\N	44.79	0.93	0.46	1.53	0.51	\N	0.41	\N	quach-hoai.png
司馬懿	sa-ma-kha	Sa Ma Kha	shu	4	\N	/images/generals/sa-ma-kha.png	\N	{}	B	B	A	B	C	141	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	115.54	51.22	81.77	23.31	40.39	89.43	1.66	0.38	0.83	0.49	0.81	0.97	\N	sa-ma-kha.png
大乔	dai-kieu	Đại Kiều	wu	4	\N	/images/generals/dai-kieu.png	\N	{}	C	C	B	C	C	263	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	16.7	137.6	69.35	98.9	\N	92	0.3	2.4	0.65	1.1	\N	1	\N	dai-kieu.png
Phan Phụng	phan-phung	Phan Phụng	qun	3	\N	/images/generals/phan-phung.png	\N	{}	A	B	B	A	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	109.49	28.21	68.5	16.72	\N	71.72	1.71	0.17	0.66	0.14	\N	0.2	\N	phan-phung.png
布才	bo-chat	Bộ Chất	wu	3	\N	/images/generals/bo-chat.png	\N	{}	B	C	C	B	A	158	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	63.5	79.14	92.48	98.84	\N	66.02	0.66	0.48	1.08	0.68	\N	0.9	\N	bo-chat.png
呂範	lu-pham	Lữ Phạm	wu	5	\N	/images/generals/lu-pham.png	\N	{}	B	B	C	B	A	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	87.89	85.53	91.24	107.49	\N	81.01	1.31	0.87	0.96	1.77	\N	0.79	\N	lu-pham.png
簡雍	gian-ung	Giản Ung	shu	5	\N	/images/generals/gian-ung.png	\N	{}	C	B	A	C	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	43.21	89.01	42.8	106.15	94.57	76.3	0.59	0.79	1.2	1.85	1.03	0.7	\N	gian-ung.png
张角	truong-giac	Trương Giác	qun	6	\N	/images/generals/truong-giac.png	\N	{}	A	S	S	B	A	237	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	32.6	148.16	113.79	101.09	\N	45.21	0.4	2.64	1.41	1.11	\N	0.59	\N	truong-giac.png
伊籍	y-tich	Y Tịch	shu	6	\N	/images/generals/y-tich.png	\N	{}	S	B	B	A	C	326	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 12:17:56.527	30.08	58.31	60.73	101.2	\N	122.75	0.32	0.49	1.67	0.8	\N	2.25	\N	y-tich.png
Quan Hưng	quan-hung	Quan Hưng	shu	6	\N	/images/generals/quan-hung.png	\N	{}	A	A	B	S	C	207	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	129.7	88.49	106.97	67.31	\N	84.86	2.3	0.71	1.63	0.49	\N	0.94	\N	quan-hung.png
虎舍儿	ho-xa-nhi	Hồ Xa Nhi	qun	6	\N	/images/generals/ho-xa-nhi.png	\N	{}	B	C	B	S	C	152	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	116.39	106.71	91.47	2.19	\N	52.59	1.81	2.09	1.13	0.01	\N	0.61	\N	ho-xa-nhi.png
Hoàng Nguyệt Anh	hoang-nguyet-anh	Hoàng Nguyệt Anh	shu	4	\N	/images/generals/hoang-nguyet-anh.png	\N	{}	C	C	C	C	S	260	\N	Công Thần	\N	needs_update	2026-01-18 06:41:42.425	2026-01-21 06:59:28.431	39.74	86.33	83.65	100.49	\N	126.19	0.46	1.07	1.35	0.71	\N	2.01	\N	hoang-nguyet-anh-2.png
甄宓	trinh-pho	Trinh Phổ	wu	5	\N	/images/generals/trinh-pho.png	\N	{}	B	A	A	S	B	\N	41	\N	Khắc Địch Chế Thắng	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:51:37.498	101.61	93.17	123.14	79.89	\N	68.91	1.19	0.43	2.06	0.31	\N	0.89	\N	trinh-pho.png
严颜	nghiem-nhan	Nghiêm Nhan	shu	6	\N	/images/generals/nghiem-nhan.png	\N	{}	B	A	S	A	B	205	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	115.77	66.39	115.72	80.44	\N	98.65	1.83	0.81	1.88	0.76	\N	1.35	\N	nghiem-nhan.png
张鲁	truong-lo	Trương Lỗ	qun	5	\N	/images/generals/truong-lo.png	\N	{}	C	C	A	B	C	154	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	31.32	126.24	65.63	96.81	107.06	51.96	0.28	1.96	0.77	0.99	1.74	0.84	\N	truong-lo.png
田豐	dien-phong	Điền Phong	qun	6	\N	/images/generals/91_dien_phong.jpg	\N	{}	A	S	B	A	A	234	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	34.89	75.59	136.89	97.82	109.8	72.21	0.31	0.61	2.31	1.36	1.2	0.59	\N	dien-phong.png
朱治	thu-thu	Thư Thụ	qun	6	\N	/images/generals/thu-thu.png	\N	{}	B	S	S	A	A	232	\N	Giảm Thống Chấn Xa	\N	complete	2026-01-18 06:41:42.425	2026-01-21 07:36:51.773	42.98	92.62	114.86	123.77	\N	59.68	0.42	0.98	1.94	1.83	\N	0.72	\N	thu-thu.png
张昭	truong-chieu	Trương Chiêu	wu	7	\N	/images/generals/truong-chieu.png	\N	{}	C	C	C	B	C	436	42	Công Huân Khắc Cử	Binh Phong	complete	2026-01-18 06:41:42.425	2026-01-18 17:22:29.789	8.89	96.53	47.06	147.92	\N	62.35	0.31	0.87	0.74	2.68	\N	0.65	\N	truong-chieu.png
张让	truong-nhuong	Trương Nhượng	qun	5	\N	/images/generals/truong-nhuong.png	\N	{}	C	S	A	B	B	252	87	\N	Dốc Sức Tính Kế	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:22:12.479	44.73	41.55	64.49	81.77	122.38	71.44	0.67	0.45	1.71	0.83	2.02	0.76	\N	truong-nhuong.png
顾雍	co-ung	Cố Ung	wu	5	\N	/images/generals/co-ung.png	\N	{}	C	B	C	B	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	40.23	90.63	67.13	125.53	\N	71.1	1.17	0.77	1.27	1.87	\N	0.9	\N	co-ung.png
郭汜	quach-di	Quách Dĩ	qun	5	\N	/images/generals/quach-di.png	\N	{}	A	C	C	B	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	106.97	13.57	80.72	14.57	20.79	62.71	1.63	0.03	0.88	0.03	0.41	1.09	\N	quach-di.png
丁奉	dinh-phung	Đinh Phụng	wu	5	\N	/images/generals/dinh-phung.png	\N	{}	B	A	B	S	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	110.02	69.1	111.4	63.17	\N	88.87	1.58	0.9	1.6	0.43	\N	0.73	\N	dinh-phung.png
sp诸葛亮	sp-gia-cat-luong	SP Gia Cát Lượng	shu	6	\N	/images/generals/sp-gia-cat-luong.png	\N	{}	C	B	S	S	S	204	\N	\N	\N	complete	2026-01-18 06:41:42.425	2026-01-18 16:16:33.714	45.79	126.2	142.84	144.59	157	47.45	0.41	1.8	2.36	2.61	3	0.55	\N	gia-cat-luong.png
步练师	bo-luyen-su	Bộ Luyện Sư	wu	6	\N	/images/generals/bo-luyen-su.png	\N	{}	C	C	B	C	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	35.84	85.91	74.17	89.1	\N	57.61	1.36	1.89	1.43	0.9	\N	1.19	\N	bo-luyen-su.png
貂蝉	trau-thi	Trâu Thị	qun	3	\N	/images/generals/dieu-thuyen.png	\N	{}	C	B	C	C	C	268	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	7.33	128.14	47.75	78.53	\N	89.27	0.07	2.06	1.25	0.87	\N	1.33	\N	trau-thi.png
sp关羽	sp-quan-vu	SP Quan Vũ	shu	7	\N	/images/generals/sp-quan-vu.png	\N	{}	S	A	C	S	C	177	59	\N	\N	complete	2026-01-18 06:41:42.425	2026-01-18 14:01:47.895	147.92	98.7	135.76	71.5	\N	98.95	2.68	0.3	2.04	0.5	\N	1.05	\N	quan-vu.png
蒋钦	tuong-kham	Tưởng Khâm	wu	5	\N	/images/generals/tuong-kham.png	\N	{}	B	A	S	B	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	118.77	99.27	105.17	58.15	\N	73.76	1.83	1.33	1.43	0.85	\N	1.04	\N	tuong-kham.png
呂布	lu-bo	Lữ Bố	qun	7	\N	/images/generals/lu-bo.png	\N	{}	S	B	S	A	C	185	34	\N	\N	complete	2026-01-18 06:41:42.425	2026-01-18 17:06:23.169	157.76	51.02	123.6	14.52	31.13	100.79	3.04	0.58	1.4	0.08	0.27	1.41	\N	lu-bo.png
钟会	chung-do	Chung Do	wei	5	\N	/images/generals/chung-hoi.png	\N	{}	C	B	B	C	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 12:17:56.529	47.18	94.63	95.84	126.15	99.61	72.72	1.22	0.77	1.36	1.85	1.19	0.88	\N	chung-do.png
司马徽	tu-ma-huy	Tư Mã Huy	qun	4	\N	/images/generals/tu-ma-huy.png	\N	{}	C	C	B	C	C	265	33	\N	Dụ Địch Thâm Nhập	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:23:59.915	10.47	129.7	35.06	128.96	\N	130.19	0.13	2.3	0.74	1.84	\N	2.01	\N	tu-ma-huy.png
Trần Đáo	tran-dao	Trần Đáo	shu	6	\N	/images/generals/tran-dao.png	\N	{}	C	B	B	S	B	57	57	Bạch Nhị Binh	Bạch Nhị Binh	needs_update	2026-01-18 06:41:42.425	2026-01-21 03:57:36.891	101.78	79.07	89.68	65.35	97.02	71.05	1.62	0.53	0.72	0.65	1.58	0.95	SR	tran-dao.png
孙策	ton-sach	Tôn Sách	wu	5	\N	/images/generals/ton-sach.png	\N	{}	S	B	A	S	A	250	\N	Giang Đông Triệu Bá Vương	\N	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:30:22.083	133.8	97.13	122.03	76.46	46.44	94.14	2.2	0.27	1.37	0.34	0.76	1.06	\N	ton-sach.png
董卓	dong-trac	Đổng Trác	qun	6	\N	/images/generals/dong-tap.png	\N	{}	A	S	S	B	C	226	31	\N	Bạo Lệ Vô Nhân	needs_update	2026-01-18 06:41:42.425	2026-01-21 03:58:31.866	122.15	39.47	124.33	64.89	\N	81.76	1.85	0.13	2.07	0.31	\N	1.04	SP	sp-dong-trac.png
黄忠	hoang-trung	Hoàng Trung	shu	6	\N	/images/generals/huong-sung.png	\N	{}	A	S	S	A	C	212	\N	Bách Phát Bách Trúng	\N	needs_update	2026-01-18 06:41:42.425	2026-01-21 03:50:06.341	136.7	67.39	121.54	60.74	\N	85.33	2.3	0.81	1.66	0.46	\N	1.07	\N	hoang-trung.png
邓艾	dang-ngai	Đặng Ngãi	wei	5	\N	/images/generals/dang-ngai.png	\N	{}	A	B	A	S	S	244	\N	Ám Độ Trần Thương	\N	needs_update	2026-01-18 06:41:42.425	2026-01-21 04:25:23.399	120.06	86.15	128.91	98.1	123.01	95.09	1.74	0.85	1.89	0.9	1.79	1.11	\N	dang-ngai.png
潘璋	phan-chuong	Phan Chương	wu	5	\N	/images/generals/phan-chuong.png	\N	{}	B	B	A	A	C	135	135	\N	Bất Nhục Sứ Mệnh	needs_update	2026-01-18 06:41:42.425	2026-01-21 03:58:51.331	113.63	19.22	95.57	36.74	\N	96.61	1.77	0.38	1.03	0.46	\N	1.19	\N	phan-chuong.png
陆抗	luc-khang	Lục Kháng	wu	6	\N	/images/generals/luc-khang.png	\N	{}	A	B	S	A	S	223	\N	Hiệu Thắng Duy Ác	\N	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:37:40.756	75.73	120.44	129.38	109.7	125.76	62.78	0.67	1.76	2.02	1.3	2.04	0.62	\N	luc-khang.png
韩遂	han-toai	Hàn Toại	qun	5	\N	/images/generals/han-toai.png	\N	{}	A	C	C	B	A	12	12	Ám Tàng Huyền Cơ	Ám Tàng Huyền Cơ	needs_update	2026-01-18 06:41:42.425	2026-01-21 04:25:43.661	105.02	90.07	111.4	68.98	\N	63.1	1.58	0.53	1.6	0.42	\N	0.9	\N	han-toai.png
徐晃	tu-hoang	Từ Hoảng	wei	6	\N	/images/generals/tu-hoang.png	\N	{}	A	S	C	A	B	201	38	\N	Hợp Quân Tụ Chúng	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:42:42.151	129.71	77.46	118.93	53.7	\N	74.87	2.09	0.34	1.47	0.3	\N	0.73	\N	tu-hoang.png
曹操	tao-thao	Tào Tháo	wei	7	\N	/images/generals/tao-thao.png	\N	{}	S	S	A	A	B	\N	357	\N	\N	complete	2026-01-18 06:41:42.425	2026-01-21 07:50:02.461	97.27	127.35	150.3	126.3	127.86	86.42	1.33	1.65	2.7	1.7	1.94	1.18	SSR	tao-thao.png
Lý Nghiêm	ly-nghiem	Lý Nghiêm	shu	4	\N	/images/generals/ly-nghiem.png	\N	{}	C	B	C	B	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	106.61	74.44	99.91	107.44	\N	100.7	1.19	0.76	0.89	1.76	\N	1.3	\N	ly-nghiem.png
Khúc Nghĩa	khuc-nghia	Khúc Nghĩa	qun	6	\N	/images/generals/khuc-nghia.png	\N	{}	B	C	S	C	B	7	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	106.07	63.35	114.39	24.51	\N	62.78	1.53	0.65	1.81	0.29	\N	0.62	\N	khuc-nghia.png
刘表	luu-bieu	Lưu Biểu	qun	3	\N	/images/generals/luu-bieu.png	\N	{}	B	B	A	C	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	39.17	120.43	61.87	99.05	\N	51.63	0.43	1.97	0.73	0.95	\N	0.77	\N	luu-bieu.png
关平	quan-binh	Quan Bình	shu	5	\N	/images/generals/quan-binh.png	\N	{}	A	A	C	A	C	140	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	113.16	85.12	105.84	68.36	87.01	73.15	1.64	0.48	1.36	0.44	0.79	0.85	\N	quan-binh.png
张曼成	truong-man-thanh	Trương Mạn Thành	qun	5	\N	/images/generals/truong-man-thanh.png	\N	{}	B	A	C	A	A	24	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	111.97	61.93	96.09	54.22	52.79	78.88	1.63	0.47	1.11	0.38	0.41	1.52	SR	truong-man-thanh.png
岳進	nhac-tien	Nhạc Tiến	wei	5	\N	/images/generals/nhac-tien.png	\N	{}	S	A	B	S	S	243	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	124.14	90.23	113.63	56.89	\N	69.68	2.06	1.17	1.77	0.31	\N	0.72	\N	nhac-tien.png
王元姬	vuong-nguyen-co	Vương Nguyên Cơ	wei	5	\N	/images/generals/vuong-nguyen-co.png	\N	{}	A	B	A	S	C	241	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	44.03	64.06	89.67	93.43	\N	76	0.37	0.74	1.93	0.97	\N	1	\N	vuong-nguyen-co.png
孔融	khong-dung	Khổng Dung	qun	5	\N	/images/generals/khong-dung.png	\N	{}	A	B	C	C	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	5.19	83.05	58.31	98.18	106.63	54.91	0.01	0.95	1.49	1.22	1.77	0.89	\N	khong-dung.png
韓德	ham-trach	Hám Trạch	wu	3	\N	/images/generals/ham-trach.png	\N	{}	C	C	C	B	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	56.18	74.9	49.65	87.9	\N	59.04	0.38	0.1	0.35	0.1	\N	0.48	\N	ham-trach.png
陆逊	luc-ton	Lục Tốn	wu	7	\N	/images/generals/luc-ton.png	\N	{}	C	B	S	A	A	180	29	Hỏa Thiêu Liên Doanh	\N	complete	2026-01-18 06:41:42.425	2026-01-21 07:41:03.53	76.98	107.1	129.72	111.13	\N	52.68	0.42	0.9	1.88	1.27	\N	0.72	\N	luc-ton.png
Tử Thịnh	tu-thinh	Tử Thịnh	wu	4	\N	/images/generals/tu-thinh.png	\N	{}	B	B	S	B	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	116.72	82.12	102.15	72.41	\N	94.53	1.88	0.48	0.85	0.39	\N	0.87	\N	tu-thinh.png
张春华	truong-xuan-hoa	Trương Xuân Hoa	wei	3	\N	/images/generals/truong-xuan-hoa.png	\N	{}	A	A	A	C	B	266	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	56.6	82.25	85.46	89.48	\N	59.97	0.4	0.75	1.34	0.92	\N	0.63	\N	truong-xuan-hoa.png
韩当	han-duong	Hàn Đương	wu	6	\N	/images/generals/han-duong.png	\N	{}	A	B	S	C	C	136	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	119.39	59.74	77.15	104.88	\N	68.43	1.81	0.46	0.85	1.52	\N	0.97	\N	han-duong.png
董白	dong-bach	Đổng Bạch	wu	3	\N	/images/generals/dong-bach.png	\N	{}	C	C	C	B	C	269	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	105.34	78.18	93.97	68.73	\N	57.84	1.86	1.22	1.63	0.67	\N	0.36	\N	dong-bach.png
张苞	truong-bao	Trương Bào	qun	6	\N	/images/generals/truong-bao.png	\N	{}	B	S	A	A	S	206	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	75.94	90.17	115.11	84.36	\N	37.22	0.26	0.43	1.69	0.44	\N	0.38	SP	sp-truong-bao.png
曹植	tao-thuc	Tào Thực	wei	6	\N	/images/generals/tao-thuc.png	\N	{}	B	B	C	C	B	195	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	35.68	123.7	52.19	101.73	\N	53.81	0.72	2.3	1.01	1.67	\N	0.99	\N	tao-thuc.png
刘封	luu-phong	Lưu Phong	shu	5	\N	/images/generals/luu-phong.png	\N	{}	C	B	A	B	A	16	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	110.73	83.6	94.19	57.98	\N	98.32	1.67	0.4	1.01	0.42	\N	1.28	\N	luu-phong.png
sp孫堅	sp-ton-kien	SP Tôn Kiên	wu	6	\N	/images/generals/sp-ton-kien.png	\N	{}	A	S	S	A	C	222	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	128	97.27	132.95	81.55	\N	42.55	2	0.33	2.05	0.45	\N	0.45	\N	ton-kien.png
赵云	trieu-van	Triệu Vân	shu	6	\N	/images/generals/trieu-van.png	\N	{}	S	A	A	S	C	213	59	Gan Góc Phi Thưởng	Hoành Tảo Thiên Quân	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:42:09.405	145.78	91.09	135.14	78.3	\N	95.24	2.62	1.11	2.06	0.7	\N	0.96	\N	trieu-van.png
小乔	tieu-kieu	Tiểu Kiều	wu	3	\N	/images/generals/tieu-kieu.png	\N	{}	C	C	B	C	C	267	65	\N	Đoạt Hồn Hiệp Phách	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:15:35.956	18.65	136.65	53.3	96.85	\N	92.05	0.35	2.35	0.7	1.05	\N	0.95	\N	tieu-kieu.png
李儒	ly-nho	Lý Nho	qun	5	\N	/images/generals/ly-nho.png	\N	{}	S	B	A	B	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 12:17:56.531	31.89	73.63	80.38	93.81	\N	132.9	0.31	0.77	1.02	0.99	\N	2.1	\N	ly-nho.png
sp吕蒙	sp-lu-mong	SP Lữ Mông	wu	7	\N	/images/generals/sp-lu-mong.png	\N	{}	B	B	S	S	S	179	86	\N	Ích Kì Kim Cố	complete	2026-01-18 06:41:42.425	2026-01-18 17:28:22.447	118.24	103.28	134.13	96.62	\N	48.21	1.96	1.12	2.27	0.98	\N	0.59	SP	sp-lu-mong.png
許褚	hua-chu	Hứa Chử	wei	6	\N	/images/generals/hua-chu.png	\N	{}	A	S	B	S	C	196	25	Hổ Dại	\N	complete	2026-01-18 06:41:42.425	2026-01-21 07:40:06.58	146.35	69.26	102.69	21.9	\N	43.03	2.65	0.54	1.51	0.1	\N	0.37	\N	hua-chu.png
sp郭嘉	sp-quach-gia	SP Quách Gia	wei	6	\N	/images/generals/sp-quach-gia.png	\N	{}	S	A	A	B	B	191	\N	Dọc Ngang Trời Đất	\N	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:19:19.917	19.37	102.57	122.39	104.9	\N	146.16	0.23	1.03	1.81	1.1	\N	2.64	SP	sp-quach-gia.png
马超	ma-sieu	Mã Siêu	qun	7	\N	/images/generals/ma-sieu.png	\N	{}	S	B	B	S	B	176	25	Giáo Huyết Tung Hoành	Đánh Đâu Thắng Đó	complete	2026-01-18 06:41:42.425	2026-01-21 07:31:08.379	149.63	93.4	126.25	31.7	\N	58.44	2.77	0.6	1.75	0.3	\N	0.76	SP	sp-ma-sieu.png
王双	vuong-song	Vương Song	wei	5	\N	/images/generals/vuong-song.png	\N	{}	A	S	C	A	C	240	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	132.65	32.89	94.36	27.32	\N	83.91	2.35	0.31	1.44	0.28	\N	0.89	\N	vuong-song.png
郭图	quach-do	Quách Đồ	qun	4	\N	/images/generals/quach-do.png	\N	{}	A	B	B	C	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	60.83	44.98	81.07	87.57	\N	74.58	0.57	0.42	1.53	1.03	\N	0.82	\N	quach-do.png
管亥	quan-hoi	Quản Hợi	qun	4	\N	/images/generals/quan-hoi.png	\N	{}	A	C	C	A	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	118.86	31.65	87.1	10.89	\N	82.52	1.94	0.35	0.9	0.31	\N	1.08	\N	quan-hoi.png
满宠	man-sung	Mãn Sủng	wei	5	\N	/images/generals/man-sung.png	\N	{}	A	S	A	B	A	238	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	81.48	109.07	122.05	115.16	\N	81.52	0.92	1.53	1.95	1.64	\N	1.08	\N	man-sung.png
朱商	chu-thuong	Chu Thương	shu	5	\N	/images/generals/chu-thuong.png	\N	{}	B	A	C	A	C	23	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	119.34	74.62	94.79	36.04	\N	52.07	1.86	0.98	1.41	0.16	\N	0.53	\N	chu-thuong.png
王异	vuong-di	Vương Dị	wei	6	\N	/images/generals/vuong-di.png	\N	{}	A	B	S	C	B	193	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	58.79	104.54	105.49	84.53	120.95	60.21	0.41	1.66	1.71	0.87	2.05	0.59	\N	vuong-di.png
Phan Tuấn	phan-tuan	Phan Tuấn	wu	3	\N	/images/generals/phan-tuan.png	\N	{}	B	C	C	B	C	158	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	23.85	31.13	78.82	95.58	\N	64.43	0.31	0.53	0.94	0.71	\N	0.81	\N	phan-tuan.png
孫皓	ton-hao	Tôn Hạo	wu	3	\N	/images/generals/ton-hao.png	\N	{}	B	C	A	C	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	92.95	12.63	50.31	33.62	\N	61.43	1.05	0.51	0.49	0.56	\N	0.81	\N	ton-hao.png
曹覽	cao-lam	Cao Lãm	wei	5	\N	/images/generals/cao-lam.png	\N	{}	A	A	B	S	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	121.33	74.35	102.03	63.93	\N	77.72	2.07	0.65	1.37	0.47	\N	0.88	\N	cao-lam.png
李催	ly-thoi	Lý Thôi	qun	5	\N	/images/generals/ly-thoi.png	\N	{}	A	C	C	B	B	150	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	104.49	19.47	89.71	1	\N	64.33	1.71	0.13	1.09	0	\N	1.07	\N	ly-thoi.png
沈配	tham-phoi	Thẩm Phối	qun	5	\N	/images/generals/tham-phoi.png	\N	{}	B	C	A	B	A	148	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	62.66	87.86	104.13	92	\N	40.12	0.14	0.94	1.27	1	\N	0.48	\N	tham-phoi.png
费祎	phi-y	Phí Y	shu	5	\N	/images/generals/phi-y.png	\N	{}	B	B	B	B	A	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	51.09	96.68	98.09	125.44	\N	74.15	1.11	0.72	1.11	1.76	\N	0.85	\N	phi-y.png
马岱	ma-dai	Mã Đại	shu	6	\N	/images/generals/ma-dai.png	\N	{}	S	S	B	A	B	208	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	124.71	89.39	105.41	64.26	\N	81.76	2.09	0.81	1.39	0.54	\N	1.04	\N	ma-dai.png
李典	ly-dien	Lý Điển	wei	3	\N	/images/generals/ly-dien.png	\N	{}	C	A	B	B	S	138	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	102.84	66.82	92.82	83.69	\N	106.36	1.36	0.78	0.78	0.51	\N	1.44	\N	ly-dien.png
夏侯惇	ha-hau-don	Hạ Hầu Đôn	wei	6	\N	/images/generals/xa-tru.png	\N	{}	S	S	C	A	B	202	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	129.9	88.42	131.33	75.89	\N	78.96	2.1	1.18	2.07	0.31	\N	0.84	\N	ha-hau-don.png
紀靈	ky-linh	Kỷ Linh	qun	6	\N	/images/generals/ky-linh.png	\N	{}	S	A	B	C	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	118.53	63.93	115.81	55.6	63.54	49.08	1.87	0.47	1.99	0.4	0.66	0.32	\N	ky-linh.png
诸葛瑾	gia-cat-can	Gia Cát Cẩn	wu	4	\N	/images/generals/gia-cat-can.png	\N	{}	C	B	B	C	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	59.46	105.77	103.5	124.34	103.61	82.72	1.34	0.83	1.5	1.86	1.19	0.88	\N	gia-cat-can.png
孟获	manh-hoach	Mạnh Hoạch	qun	7	\N	/images/generals/manh-hoach.png	\N	{}	S	S	B	A	C	182	42	Nam Man Cự Khôi	Binh Phong	complete	2026-01-18 06:41:42.425	2026-01-18 17:26:11.709	125.38	68.15	125.38	54.69	\N	53.4	2.02	0.85	2.02	0.51	\N	0.6	\N	manh-hoach.png
sp皇甫嵩	sp-hoang-pho-tung	SP Hoàng Phổ Tung	qun	6	\N	/images/generals/sp-hoang-pho-tung.png	\N	{}	A	A	A	S	S	227	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	82.47	83.21	136.65	66.12	\N	38.52	1.13	0.59	2.35	0.48	\N	1.08	SP	sp-hoang-pho-tung.png
于禁	vu-cam	Vu Cấm	wei	5	\N	/images/generals/vu-cam.png	\N	{}	A	S	B	A	C	242	41	\N	Khắc Địch Chế Thắng	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:51:37.495	116.9	60.6	104.66	70.3	90.15	46.21	2.01	0.4	1.14	0.7	0.85	0.59	\N	vu-cam.png
sp庞德	sp-bang-duc	SP Bàng Đức	wei	6	\N	/images/generals/sp-bang-duc.png	\N	{}	A	B	S	B	B	190	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	137.89	79.5	122.44	49.13	\N	42.79	2.31	0.5	1.76	0.27	\N	0.41	SP	sp-bang-duc.png
Quan Ngân Bình	quan-ngan-binh	Quan Ngân Bình	shu	6	\N	/images/generals/quan-ngan-binh.png	\N	{}	S	B	C	S	C	209	\N	Con Gái Tướng Môn	\N	needs_update	2026-01-18 06:41:42.425	2026-01-21 04:29:19.535	117.71	58.93	110.43	29.89	\N	87.99	2.09	0.47	1.97	0.31	\N	1.21	\N	quan-ngan-binh.png
太史慈	thai-su-tu	Thái Sử Từ	wu	6	\N	/images/generals/thai-su-tu.png	\N	{}	S	C	S	B	C	221	37	\N	\N	complete	2026-01-18 06:41:42.425	2026-01-21 07:13:28.731	132.71	88.09	116.41	62.37	\N	88.19	2.09	1.11	1.39	0.23	\N	1.01	\N	thai-su-tu.png
Thái Văn Cơ	thai-van-co	Thái Văn Cơ	qun	3	\N	/images/generals/thai-van-co.png	\N	{}	B	C	C	C	C	270	65	\N	\N	complete	2026-01-18 06:41:42.425	2026-01-21 07:15:59.506	15.94	107.8	92.35	96.53	\N	95.89	0.26	1.2	1.65	0.87	\N	1.31	\N	thai-van-co.png
sp周瑜	sp-chu-du	SP Chu Du	wu	6	\N	/images/generals/sp-chu-du.png	\N	{}	B	A	S	A	C	215	\N	Giang Thiên Trưởng Diệm	\N	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:30:53.899	79.93	111.24	126.54	117.92	\N	54.73	0.47	0.96	1.66	1.68	\N	0.67	\N	chu-du.png
马铁	ma-thiet	Mã Thiết	qun	5	\N	/images/generals/ma-thiet.png	\N	{}	A	B	B	C	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	75.3	98.67	88.43	70.24	\N	73.49	0.7	1.93	0.97	0.96	\N	0.71	\N	ma-thiet.png
甘寧	cam-ninh	Cam Ninh	wu	6	\N	/images/generals/cam-ninh.png	\N	{}	A	A	S	S	S	218	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	143.4	71.3	122.83	26.36	\N	95.37	2.6	0.7	1.57	0.44	\N	1.23	\N	cam-ninh.png
Biện Hỷ	bien-hy	Biện Hỷ	wei	3	\N	/images/generals/bien-hy.png	\N	{}	C	B	C	B	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	81.97	25.9	75.15	38.9	\N	22.99	0.63	0.1	1.01	0.1	\N	0.21	\N	bien-hy.png
全琮	toan-tong	Toàn Tông	wu	3	\N	/images/generals/toan-tong.png	\N	{}	B	B	C	C	A	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	87.43	68.9	92.36	62.9	\N	54.84	0.81	0.1	0.76	0.1	\N	0.52	\N	toan-tong.png
Trần Vũ	tran-vu	Trần Vũ	wu	6	\N	/images/generals/tran-vu.png	\N	{}	B	A	C	A	C	22	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	121.96	72.07	107.54	47.41	\N	65.63	1.84	0.53	1.66	0.39	\N	0.77	\N	tran-vu.png
Trần Lâm	tran-lam	Trần Lâm	wei	5	\N	/images/generals/tran-lam.png	\N	{}	C	C	B	C	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	32.37	88.53	47.04	113.72	94.57	81.58	1.23	0.87	1.16	1.88	1.03	0.82	\N	tran-lam.png
黄权	hoang-quyen	Hoàng Quyền	shu	6	\N	/images/generals/hoang-quyen.png	\N	{}	C	B	S	B	C	21	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	70.78	97.95	102.93	98.57	\N	35.84	0.62	1.05	1.47	1.03	\N	0.36	\N	hoang-quyen.png
田豫	dien-vi	Điển Vi	wei	6	\N	/images/generals/dien-vi.png	\N	{}	B	S	C	A	C	186	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	144.78	60.28	106.77	30.9	\N	95.75	2.62	0.12	1.83	0.1	\N	1.25	\N	dien-vi.png
臧霸	tang-ba	Tang Bá	wei	4	\N	/images/generals/tang-ba.png	\N	{}	C	A	C	B	C	139	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	108.82	80.63	97.95	58.85	\N	56.04	1.78	0.77	1.05	0.15	\N	0.16	\N	tang-ba.png
兀突骨	ngot-dot-cot	Ngột Đột Cốt	qun	6	\N	/images/generals/ngot-dot-cot.png	\N	{}	S	S	C	B	C	53	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	120.58	28.98	123.08	5.28	\N	33.18	1.82	0.42	2.32	0.12	\N	0.38	\N	ngot-dot-cot.png
朱泰	chu-thai	Chu Thái	wu	6	\N	/images/generals/chu-thai.png	\N	{}	S	S	A	A	C	219	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	127.29	62.47	123.52	43.89	\N	68.96	1.91	0.13	2.08	0.31	\N	0.84	\N	chu-thai.png
张绣	truong-tu	Trương Tú	qun	6	\N	/images/generals/truong-tu.png	\N	{}	B	B	C	S	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	106.44	66.22	99.57	53.36	85.09	97.56	1.76	0.38	1.03	0.44	1.11	1.24	\N	truong-tu.png
王平	vuong-binh	Vương Bình	shu	5	\N	/images/generals/vuong-binh.png	\N	{}	B	B	S	C	C	58	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	103.7	71.15	110.36	65.22	\N	99.75	1.3	0.85	1.44	0.38	\N	1.25	\N	vuong-binh.png
傅士仁	pho-si-nhan	Phó Sĩ Nhân	shu	4	\N	/images/generals/pho-si-nhan.png	\N	{}	B	C	B	B	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	76.57	21.9	70.47	25.9	\N	25.05	0.71	0.1	1.29	0.1	\N	0.27	\N	pho-si-nhan.png
Đào Khiêm	dao-khiem	Đào Khiêm	qun	4	\N	/images/generals/dao-khiem.png	\N	{}	C	C	B	B	A	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	33.92	86.39	64.3	70.66	\N	42.17	0.36	0.49	0.7	0.4	\N	0.59	\N	dao-khiem.png
馬騰	ma-dang	Mã Đằng	qun	5	\N	/images/generals/ma-dang.png	\N	{}	S	C	B	C	C	55	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	113.63	98.58	104.91	70.63	63.63	73.07	1.77	0.5	1.21	0.61	0.61	0.85	\N	ma-dang.png
朱桓	chu-hoan	Chu Hoàn	wu	6	\N	/images/generals/chu-hoan.png	\N	{}	A	C	A	A	C	147	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	107.84	78.95	118.58	75.57	96.57	37.84	1.36	1.05	1.82	1.03	1.03	0.36	\N	chu-hoan.png
王惇	vuong-doan	Vương Doãn	qun	3	\N	/images/generals/vuong-doan.png	\N	{}	C	C	C	B	C	160	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	9.19	84.4	50.21	95.31	\N	62.63	0.17	0.44	1.27	0.81	\N	0.77	\N	vuong-doan.png
孫權	ton-quyen	Tôn Quyền	wu	6	\N	/images/generals/ton-quyen.png	\N	{}	S	B	S	A	C	217	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	99.49	92.77	111.11	115.98	\N	109.64	1.71	0.83	1.69	1.42	\N	1.56	\N	ton-quyen.png
刘备	luu-bi	Lưu Bị	shu	7	\N	/images/generals/luu-bi.png	\N	{}	S	S	A	A	C	175	68	\N	\N	complete	2026-01-18 06:41:42.425	2026-01-18 13:57:12.688	102.84	150.3	118.62	104.89	\N	109.73	1.36	2.7	1.98	1.31	\N	1.67	\N	luu-bi.png
sp曹真	sp-tao-chan	SP Tào Chân	wei	6	\N	/images/generals/sp-tao-chan.png	\N	{}	S	S	B	A	C	188	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	96.42	96.17	124.32	80.74	\N	71.2	1.18	0.43	2.28	0.46	\N	0.8	SP	tao-chan-2.png
太戎	thai-ung	Thái Ung	qun	6	\N	/images/generals/thai-ung.png	\N	{}	C	C	B	C	C	230	\N	Biệt Đuợc Gỗ Tốt	\N	needs_update	2026-01-18 06:41:42.425	2026-01-21 03:55:27.352	19.99	104.56	38.59	137.21	\N	52.59	0.21	1.24	0.61	2.59	\N	0.61	\N	thai-ung.png
張郃	truong-cap	Trương Cáp	wei	6	\N	/images/generals/truong-cap.png	\N	{}	A	S	B	S	A	67	67	\N	Đại Kích Sĩ	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:09:22.211	128.33	82.4	115.98	62.7	\N	90.86	2.07	0.6	1.42	0.3	\N	0.94	\N	truong-cap.png
左慈	ta-tu	Tả Từ	qun	5	\N	/images/generals/ta-tu.png	\N	{}	C	C	C	C	C	257	27	Kim Đơn Mật Thuật	Sợ Bóng Sợ Gió	needs_update	2026-01-18 06:41:42.425	2026-01-21 09:18:08.361	16.27	15.63	51.86	38.2	138.65	39.36	0.33	0.77	0.94	0.8	2.35	0.44	\N	ta-tu.png
姜维	khuong-duy	Khương Duy	shu	6	\N	/images/generals/khuong-duy.png	\N	{}	S	A	S	A	C	210	78	\N	Hình Cơ Quân Lược	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:38:05.508	127.19	83.19	130.95	83.53	\N	128.57	2.01	1.01	2.05	0.87	\N	2.03	\N	khuong-duy.png
sp许褚	sp-hua-chu	SP Hứa Chử	wei	6	\N	/images/generals/sp-hua-chu.png	\N	{}	A	S	B	S	C	187	\N	Hổ Hầu	\N	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:40:36.026	146.35	69.26	102.69	21.9	\N	90.71	2.85	0.54	1.51	0.1	\N	1.09	SP	sp-hua-chu.png
花雄	hoa-hung	Hoa Hùng	qun	5	\N	/images/generals/hoa-hung.png	\N	{}	S	B	B	A	C	254	33	Khiêu Chiến Quân Hùng	\N	complete	2026-01-18 06:41:42.425	2026-01-21 07:52:46.936	137.41	63.46	113.46	47.98	\N	76.39	2.39	0.34	1.34	0.42	\N	0.81	\N	hoa-hung.png
朱然	chu-nhien	Chu Nhiên	wu	4	\N	/images/generals/chu-nhien.png	\N	{}	C	C	A	C	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	86.82	76.9	94.69	61.9	77.65	66.97	0.94	0.1	0.83	0.1	0.35	0.63	\N	chu-nhien.png
Hoàng Phổ Tung	hoang-pho-tung	Hoàng Phổ Tung	qun	5	\N	/images/generals/hoang-pho-tung.png	\N	{}	C	B	A	S	S	19	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	84.37	83.21	124.3	60.12	87.63	35.1	1.23	0.59	1.7	0.48	0.77	0.9	SSR	hoang-pho-tung.png
马谡	ma-tac	Mã Tắc	shu	5	\N	/images/generals/ma-tac.png	\N	{}	B	C	A	C	C	15	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	82.01	73.27	91.78	81.3	120.06	90.99	0.79	0.33	1.62	0.7	1.74	1.21	\N	ma-tac.png
董端	dong-doan	Đổng Đoãn	shu	6	\N	/images/generals/dong-doan.png	\N	{}	B	C	B	B	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	49.85	93.06	67.71	124.63	\N	64.21	1.15	0.74	1.09	1.77	\N	0.59	\N	dong-doan.png
曹彰	tao-chuong	Tào Chương	wei	5	\N	/images/generals/tao-chuong.png	\N	{}	A	S	B	B	B	14	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	128	86.45	107.27	42.98	\N	50.83	2	0.55	1.33	0.42	\N	0.57	\N	tao-chuong.png
My Phương	my-phuong	My Phương	shu	3	\N	/images/generals/my-phuong.png	\N	{}	C	B	C	C	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	81.48	24.9	66.5	24.9	42.37	71.77	1.08	0.1	0.66	0.1	0.55	0.67	\N	my-phuong.png
虞翻	ngu-phien	Ngu Phiên	wu	3	\N	/images/generals/ngu-phien.png	\N	{}	C	A	C	C	B	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	51.32	51.68	58.69	93.1	101.96	20.72	0.28	0.3	0.83	0.64	0.84	0.2	\N	ngu-phien.png
张廉	truong-nhiem	Trương Nhiệm	qun	5	\N	/images/generals/truong-nhiem.png	\N	{}	C	B	S	B	B	142	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	112.88	85.69	109.84	67.36	91.87	71.39	1.52	0.51	1.36	0.44	0.73	0.81	\N	truong-nhiem.png
冯纪	phung-ky	Phùng Kỳ	qun	6	\N	/images/generals/phung-ky.png	\N	{}	B	S	B	C	C	271	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	27.84	48.12	65.04	89.95	\N	45.59	0.36	0.48	1.16	1.05	\N	0.61	\N	phung-ky.png
公孙瓒	cong-ton-toan	Công Tôn Toản	qun	6	\N	/images/generals/cong-ton-toan.png	\N	{}	S	C	S	C	B	50	50	Bạch Mã Nghĩa Tòng	Bạch Mã Nghĩa Tòng	complete	2026-01-18 06:41:42.425	2026-01-21 03:57:45.049	118.72	101.4	114.85	56.72	\N	105.78	1.88	1.28	1.62	0.56	\N	1.62	\N	cong-ton-toan.png
sp劉曄	sp-luu-diep	SP Lưu Diệp	wei	6	\N	/images/generals/sp-luu-diep.png	\N	{}	S	C	S	B	S	189	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	38.46	76.79	88.49	98.65	138.55	42.93	0.34	0.41	1.71	1.35	2.45	0.47	SP	luu-diep-2.png
曹仁	tao-nhan	Tào Nhân	wei	6	\N	/images/generals/tao-nhan.png	\N	{}	A	S	B	A	C	197	30	\N	Bát Môn Kim Tỏa Trận	needs_update	2026-01-18 06:41:42.425	2026-01-21 03:54:44.738	109.94	78.47	132.89	51.89	\N	81.38	1.26	0.13	2.31	0.31	\N	1.02	SSR	tao-nhan.png
颜良	nhan-luong	Nhan Lương	qun	5	\N	/images/generals/nhan-luong.png	\N	{}	A	A	B	S	C	255	\N	Dũng Quán Tam Quản	\N	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:26:05.205	133.9	72.38	111.94	35.35	32.21	68.77	2.1	1.02	1.26	0.65	0.59	0.83	R	nhan-luong.png
杨修	duong-tu	Dương Tu	wei	6	\N	/images/generals/duong-tu.png	\N	{}	C	C	B	B	C	153	155	\N	Giản Chính	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:29:11.963	26.23	79.29	46.47	94.2	101.43	70.15	1.17	1.91	1.13	0.8	0.97	0.85	\N	duong-tu.png
sp张良	sp-truong-luong	SP Trương Lương	qun	5	\N	/images/generals/sp-truong-luong.png	\N	{}	B	A	B	S	A	11	91	\N	Gió Táp Mưa Sa	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:31:47.262	113.82	89.12	96.43	63.98	\N	97.56	1.78	0.48	0.97	0.42	\N	1.24	\N	truong-luong.png
曹純	tao-thuan	Tào Thuần	qun	5	\N	/images/generals/tao-thuan.png	\N	{}	C	S	B	C	S	\N	56	\N	Hổ Báo Kỵ	complete	2026-01-18 06:41:42.425	2026-01-21 07:39:29.096	118.3	76.3	123.19	52.61	\N	78.81	1.7	0.38	2.01	0.35	\N	0.99	\N	cao-thuan.png
Vu Cát	vu-cat	Vu Cát	qun	7	\N	/images/generals/vu-cat.png	\N	{}	C	B	C	C	C	183	27	Hưng Văn Bố Vũ	Sợ Bóng Sợ Gió	complete	2026-01-18 06:41:42.425	2026-01-21 07:44:46.655	9.99	74.5	48.96	111.75	115.59	45.46	0.21	0.5	1.84	1.25	2.61	0.34	\N	vu-cat.png
张燕	truong-yen	Trương Yến	qun	5	\N	/images/generals/truong-yen.png	\N	{}	A	A	C	B	A	149	149	Khinh Dũng Phi Yến	Khinh Dũng Phi Yến	needs_update	2026-01-18 06:41:42.425	2026-01-21 07:53:24.637	114.44	73.64	96.33	56.17	75.05	73.04	1.76	0.56	1.07	0.43	0.95	1.16	\N	truong-yen.png
Trần Quần	tran-quan	Trần Quần	wei	6	\N	/images/generals/tran-quan.png	\N	{}	C	B	B	C	C	194	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	30.53	68.25	49.86	145.78	\N	100.8	0.87	0.75	0.94	2.62	\N	1.36	\N	tran-quan.png
sp朱儁	sp-chu-tuan	SP Chu Tuấn	qun	6	\N	/images/generals/sp-chu-tuan.png	\N	{}	C	B	S	B	A	228	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	77.35	81.36	118.83	79.17	\N	59.64	0.65	0.44	1.57	0.43	\N	0.56	\N	chu-tuan.png
呂蒙	lu-mong	Lữ Mông	wu	6	\N	/images/generals/lu-mong.png	\N	{}	B	B	S	S	S	220	\N	Bạch Y Độ Giang	\N	needs_update	2026-01-18 06:41:42.425	2026-01-21 03:58:06.443	112.92	101.38	116.65	90.35	\N	48.21	1.68	1.02	1.35	0.65	\N	0.59	\N	lu-mong.png
諸葛瞻	gia-cat-chiem	Gia Cát Chiêm	shu	3	\N	/images/generals/gia-cat-chiem.png	\N	{}	B	B	C	B	C	163	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	68.44	84.63	79.84	85.58	\N	53.56	0.6	0.51	0.52	0.71	\N	0.92	\N	gia-cat-chiem.png
魏延	nguy-dien	Ngụy Diên	shu	6	\N	/images/generals/nguy-dien.png	\N	{}	A	S	B	S	C	211	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	137.03	54.88	117.11	58.69	94.23	74.76	2.37	0.52	1.69	0.51	1.17	1.04	\N	nguy-dien.png
吕建	lu-kien	Lữ Kiến	wei	3	\N	/images/generals/lu-kien.png	\N	{}	C	C	A	B	C	\N	\N	\N	\N	needs_update	2026-01-18 06:41:42.425	2026-01-18 09:37:27.353	91.55	65.49	69.77	83.61	\N	77.69	1.13	0.87	0.67	0.61	\N	0.83	\N	lu-kien.png
\.


--
-- Data for Name: line_up_formations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.line_up_formations (id, line_up_id, formation_id, "position") FROM stdin;
\.


--
-- Data for Name: line_up_skill_resolutions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.line_up_skill_resolutions (id, line_up_id, skill_id, resolved, note) FROM stdin;
\.


--
-- Data for Name: line_ups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.line_ups (id, name, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: oauth_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.oauth_accounts (id, provider, provider_id, access_token, refresh_token, user_id) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
p3sSrFKwKEnJBE3VEt3HVvGEium0BacP	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-02-20T03:34:25.403Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":"cmkmsh6ko000013598kycwzn9"}}	2026-02-20 09:19:24
\.


--
-- Data for Name: skill_exchange_generals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.skill_exchange_generals (id, skill_id, general_id, created_at) FROM stdin;
9	108	刘备	2026-01-21 03:44:57.381
10	118	曹操	2026-01-21 03:45:10.189
11	118	徐晃	2026-01-21 03:45:10.189
12	118	沈配	2026-01-21 03:45:10.189
13	118	曹洪	2026-01-21 03:45:10.189
14	118	Trần Lâm	2026-01-21 03:45:10.189
15	111	颜良	2026-01-21 07:27:20.829
16	111	宗憲	2026-01-21 07:27:20.829
\.


--
-- Data for Name: skill_inherit_generals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.skill_inherit_generals (id, skill_id, general_id, created_at) FROM stdin;
92	31	董卓	2026-01-21 03:58:31.864
93	135	潘璋	2026-01-21 03:58:51.329
3	325	马超	2026-01-18 13:30:29.076
94	12	韩遂	2026-01-21 04:25:43.66
95	71	华佗	2026-01-21 04:27:24.722
96	96	sp黄月英	2026-01-21 06:58:34.938
97	67	張郃	2026-01-21 07:09:22.209
98	37	马超	2026-01-21 07:10:06.143
99	37	典韦	2026-01-21 07:10:06.143
10	276	伊籍	2026-01-18 13:30:29.076
11	47	马岱	2026-01-18 13:30:29.076
100	25	马超	2026-01-21 07:10:39.551
13	72	黄忠	2026-01-18 13:30:29.076
15	83	马超	2026-01-18 13:30:29.076
102	25	許褚	2026-01-21 07:11:42.158
17	426	甄姬	2026-01-18 13:30:29.076
18	357	曹操	2026-01-18 13:30:29.076
19	326	伊籍	2026-01-18 13:30:29.076
103	37	太史慈	2026-01-21 07:13:28.736
104	65	小乔	2026-01-21 07:15:35.953
22	290	夏侯惇	2026-01-18 13:30:29.076
106	65	Thái Văn Cơ	2026-01-21 07:15:59.51
107	87	张让	2026-01-21 07:22:12.477
108	33	司马徽	2026-01-21 07:23:59.913
110	33	花雄	2026-01-21 07:24:29.627
29	410	王元姬	2026-01-18 13:30:29.076
111	48	张辽	2026-01-21 07:25:02.985
112	48	张姬	2026-01-21 07:25:02.985
113	60	司马懿	2026-01-21 07:26:19.705
114	155	杨修	2026-01-21 07:29:11.96
115	91	sp张良	2026-01-21 07:31:47.26
116	54	高顺	2026-01-21 07:37:03.267
36	358	马超	2026-01-18 13:30:29.076
37	384	满宠	2026-01-18 13:30:29.076
117	78	袁術	2026-01-21 07:38:05.502
39	408	张春华	2026-01-18 13:30:29.076
40	327	太史慈	2026-01-18 13:30:29.076
118	78	姜维	2026-01-21 07:38:05.502
121	56	曹純	2026-01-21 07:39:29.094
122	43	凌统	2026-01-21 07:41:48.657
123	59	关羽	2026-01-21 07:42:09.401
48	247	董昭	2026-01-18 13:30:29.076
124	59	赵云	2026-01-21 07:42:09.401
125	38	徐晃	2026-01-21 07:42:42.149
51	426	大乔	2026-01-18 13:30:29.076
126	38	袁绍	2026-01-21 07:42:42.149
127	27	Vu Cát	2026-01-21 07:44:46.653
54	384	王双	2026-01-18 13:30:29.076
128	27	左慈	2026-01-21 07:44:46.653
129	64	蒋琬	2026-01-21 07:50:02.473
130	85	许攸	2026-01-21 07:50:44.087
9	158	sp关羽	2026-01-18 13:30:29.076
38	89	sp关羽	2026-01-18 13:30:29.076
135	41	于禁	2026-01-21 07:51:37.493
136	41	甄宓	2026-01-21 07:51:37.493
52	171	sp庞德	2026-01-18 13:30:29.076
137	149	张燕	2026-01-21 07:53:24.635
25	325	sp许褚	2026-01-18 13:30:29.076
42	403	sp许褚	2026-01-18 13:30:29.076
56	29	陆逊	2026-01-18 14:37:04.811
58	35	庞统	2026-01-18 16:17:13.731
63	435	诸葛亮	2026-01-18 16:59:33.235
64	86	sp吕蒙	2026-01-18 17:02:19.686
65	34	呂布	2026-01-18 17:06:23.173
68	42	张昭	2026-01-18 17:22:29.786
69	42	孟获	2026-01-18 17:22:29.786
83	70	孙尚香	2026-01-18 18:51:11.51
85	52	祝融夫人	2026-01-21 03:46:20.437
86	36	甘宁	2026-01-21 03:48:34.54
87	30	曹仁	2026-01-21 03:54:44.736
88	146	马良	2026-01-21 03:56:56.873
90	57	Trần Đáo	2026-01-21 03:57:36.887
91	50	公孙瓒	2026-01-21 03:57:45.047
\.


--
-- Data for Name: skill_innate_generals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.skill_innate_generals (id, skill_id, general_id, created_at) FROM stdin;
82	177	关羽	2026-01-18 16:13:57.011
86	434	诸葛亮	2026-01-18 16:50:38.039
88	436	张昭	2026-01-18 17:20:50.294
89	182	孟获	2026-01-18 17:21:49.626
99	437	孙尚香	2026-01-18 18:53:08.038
100	429	司马懿	2026-01-18 18:54:06.605
101	212	黄忠	2026-01-21 03:50:06.338
102	230	太戎	2026-01-21 03:55:27.349
104	57	Trần Đáo	2026-01-21 03:57:36.88
105	50	公孙瓒	2026-01-21 03:57:45.042
106	220	呂蒙	2026-01-21 03:58:06.439
107	244	邓艾	2026-01-21 04:25:23.396
108	12	韩遂	2026-01-21 04:25:43.656
109	216	马忠	2026-01-21 04:25:52.219
110	218	甘宁	2026-01-21 04:26:45.507
111	209	Quan Ngân Bình	2026-01-21 04:29:19.533
112	260	Hoàng Nguyệt Anh	2026-01-21 06:59:28.429
113	191	sp郭嘉	2026-01-21 07:19:19.916
115	231	多思大王	2026-01-21 07:20:30.811
116	255	颜良	2026-01-21 07:26:05.203
117	213	赵云	2026-01-21 07:27:38.95
118	232	朱治	2026-01-21 07:28:54.733
119	250	孙策	2026-01-21 07:30:22.081
120	215	sp周瑜	2026-01-21 07:30:53.897
121	176	马超	2026-01-21 07:31:08.377
122	223	陆抗	2026-01-21 07:37:40.754
44	55	马超	2026-01-18 13:27:57.714
124	196	許褚	2026-01-21 07:40:06.578
52	326	伊籍	2026-01-18 13:27:57.714
125	187	sp许褚	2026-01-21 07:40:36.025
58	290	夏侯惇	2026-01-18 13:27:57.714
126	236	祝融夫人	2026-01-21 07:40:45.964
68	358	马超	2026-01-18 13:27:57.714
127	180	陆逊	2026-01-21 07:41:03.528
128	259	sp黄月英	2026-01-21 07:43:21.951
129	183	Vu Cát	2026-01-21 07:44:02.133
130	262	Gia Cát Khác	2026-01-21 07:45:23.72
131	254	花雄	2026-01-21 07:52:46.934
132	149	张燕	2026-01-21 07:53:24.63
133	249	黄盖	2026-01-21 07:53:51.237
134	257	左慈	2026-01-21 09:18:08.358
73	403	sp许褚	2026-01-18 13:27:57.714
\.


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.skills (id, slug, name, type_id, type_name, quality, trigger_rate, source_type, wiki_url, effect, target, army_types, innate_to_generals, inheritance_from_generals, acquisition_type, exchange_type, exchange_generals, exchange_count, status, screenshots, created_at, updated_at) FROM stdin;
138	truong-gia-chi-phong	Trưởng Giá Chi Phong	command	Chỉ huy	A	100	innate	\N	\N	\N	{cavalry,shield}	{}	{}	innate	\N	{}	\N	needs_update	{truong-gia-chi-phong.png}	2026-01-17 16:17:08.156	2026-01-17 16:17:08.156
139	ti-thuc-kich-hu	Tị Thực Kích Hư	active	Chủ Động	A	50	\N	\N	Phát động 1 lần tấn công Binh Dao vào cả thể quân địch có Thống Soái thấp nhất (tỷ lệ sát thương 92.5% →185%)	enemy_1	{cavalry,shield,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{ti-thuc-kich-hu.png}	2026-01-17 16:17:08.157	2026-01-17 16:17:08.157
140	phan-dot	Phản Đột	passive	Bị Động	A	100	\N	\N	Sau khi tấn công thường, khiến sát thương Binh Dao do bản thân gây ra tăng 6%→12%, tối đa cộng dồn 3 lần, và có 35% xác suất khiến mục tiêu Giao Binh Khí (không thể tấn công thường), duy trì 1 hiệp	enemy_1	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{phan-dot.png}	2026-01-17 16:17:08.159	2026-01-17 16:17:08.159
141	loan-cung-am-vu	Loạn Cung Ám Vũ	active	Chủ động	A	35	\N	\N	Sau khi tấn công thường, khiến mục tiêu tấn công giảm 75→150 điểm Thông Soái, và gây ra trạng thái Kế Tán (không thể phát động Chiến Pháp chủ động), duy trì 1 hiệp	enemy_1	{cavalry,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{loan-cung-am-vu.png}	2026-01-17 16:17:08.16	2026-01-17 16:17:08.16
142	lac-phuong	Lạc Phượng	active	Chủ Động	A	35	\N	\N	Gây cho cả thế quân địch ngẫu nhiên tận công Binh Bao (tỷ lệ sát thương 125%→250%) và Kế Tấn (không thể phát động Chiến Pháp chủ động) 1 hiệp	enemy_all	{cavalry,shield,archer}	{}	{}	\N	\N	{}	\N	needs_update	{lac-phuong.png}	2026-01-17 16:17:08.161	2026-01-17 16:17:08.161
143	lac-loi	Lạc Lối	active	Chủ Động	A	50	\N	\N	Tạo ra sát thương mưu lược và tăng sát thương mưu lược mà hạn phải chịu	\N	{cavalry,shield,spear}	{}	{}	\N	\N	{}	\N	needs_update	{lac-loi.png}	2026-01-17 16:17:08.162	2026-01-17 16:17:08.162
144	lac-loi-2	Lạc Lôi	active	Chủ động	A	50	\N	\N	Gây cho một cá nhân ngẫu nhiên cơ 5% xác suất phóng vào quân Đông Minh) tấn công Mưu Lược (tỷ lệ sát thương 85%→170%, bị Trí Lực ảnh hưởng), và khiến sát thương Mưu Lược mục tiêu phải chịu tăng 9%→18%, duy trì 2 hiệp	\N	{}	{}	{}	\N	\N	{}	\N	needs_update	{lac-loi.png}	2026-01-17 16:17:08.163	2026-01-17 16:17:08.163
145	thu-khoi-dao-lac	Thủ Khôi Dao Lạc	assault	Đột Kích	A	30	inherited	\N	Sau khi tấn công thường, lại phát động 1 lần tấn công Binh Bảo vào mục tiêu tấn công (tỷ lệ sát thương 107%→214%)	\N	{cavalry,shield,archer,spear,siege}	{}	{}	inherit	\N	{}	\N	needs_update	{thu-khoi-dao-lac.png}	2026-01-17 16:17:08.165	2026-01-17 16:17:08.165
147	thien-ly-tri-vien	Thiên Lý Trí Viên	command	Chỉ huy	A	\N	inherited	\N	Cứu Viện toàn thể quân Đông Minh, đồng thời tăng cho bản thân 20→40 Thông Soái, duy trì 1 hiệp	ally_all	{cavalry,shield,siege}	{}	{}	inherit	\N	{}	\N	needs_update	{thien-ly-tri-vien.png}	2026-01-17 16:17:08.167	2026-01-17 16:17:08.167
148	toa-thu-co-thanh	Tọa Thủ Cô Thành	active	Chủ Động	A	45	\N	\N	Hồi phục Binh Lực cho Tập thể quân ta (2 người) (tỷ lệ Trí Liệu 58%→116%, bị Trí Lực ảnh hưởng)	ally_2	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{toa-thu-co-thanh.png}	2026-01-17 16:17:08.168	2026-01-17 16:17:08.168
150	tha-linh-cuop-doat	Thả Linh Cướp Đoạt	active	Chủ động	A	35	\N	\N	Gây cho cá thể quân địch tấn công Binh Đao (tỷ lệ sát thương 86%→172%) và trang thái Chấn Động (không thể hành động), duy trì 1 hiệp	enemy_1	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tha-linh-cuop-doat.png}	2026-01-17 16:17:08.171	2026-01-17 16:17:08.171
151	tu-lanh	Tự Lành	passive	Bị Động	A	\N	innate	\N	Trong quá trình chiến đấu, làm cho bản thân rơi vào trạng thái Nghỉ Ngơi, mỗi hiệp hồi phục Binh Lực nhất định (tỷ lệ hồi phục 50%→100%)	self	{spear,shield,siege}	{}	{}	innate	\N	{}	\N	needs_update	{tu-lanh.png}	2026-01-17 16:17:08.172	2026-01-17 16:17:08.172
149	khinh-dung-phi-yen	Khinh Dũng Phi Yến	active	Chủ Động	A	40	\N	\N	Gây cho cá thể quân địch tấn công Binh Dao (tỷ lệ sát thương 42%→84%), phóng ngẫu nhiên 2-4 lần	enemy_1	{cavalry,shield,archer,spear}	{"Trương Yến"}	{"Trương Yến"}	innate	\N	{}	\N	complete	{khinh-dung-phi-yen.png}	2026-01-17 16:17:08.169	2026-01-21 07:53:24.629
170	quyet-sach	Quyết Sách	active	Chủ Động	B	30	\N	\N	Khiến bản thân nhân trạng thái tấn công nhóm (khi tấn công thường sẽ gây sát thương cho Võ Tướng khác cùng đội quân với mục tiêu) (tỷ lệ sát thương 20%→40%), duy trì 1 hiệp	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{quyet-sach.png}	2026-01-17 16:17:08.196	2026-01-17 16:17:08.196
1	quan-ho-ve	Quân Hộ Vệ	command	Chỉ Huy	S	100	inherited	\N	Trong quá trình chiến đấu, khi tướng chính quân ta sắp nhận phải tấn công, Phó Tướng tăng 6→12 Võ Lực, tỏi đã tăng 5 lần, và lần lượt gây ra sát thương Binh Đạo cho người tấn công (tỷ lệ sát thương 36%→72%, bị Binh Lực tổn thất của bản thân ảnh hưởng, tỏi đã tăng 20%→40%), mỗi hiệp tỏi đã kích hoạt 1 lần, nếu Biến Vị hoặc Hỗa Chủ thống lĩnh, bản thân tăng 25→50 Thống Soái	ally_all	{shield}	{}	{}	inherit	\N	{}	\N	needs_update	{quan-ho-ve.png}	2026-01-17 16:17:07.976	2026-01-17 16:17:07.976
2	tien-thanh-ky-lu	Tiên Thanh Kỳ Lư	assault	Đột Kích	S	50	\N	\N	Sau khi tấn công thường, sẽ gây thêm cho mục tiêu tấn công 1 lần tấn công Mưu Lược (tỉ lệ sát thương 72.5% →145%, bị Trí Lực ảnh hưởng), đồng thời giúp xác suất sử dụng Chiến Pháp Chủ Động của bản thân tăng 7.5% →15%, duy trì 1 hiệp	\N	{cavalry,shield,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tien-thanh-ky-lu.png}	2026-01-17 16:17:07.978	2026-01-17 16:17:07.978
4	the-hien-tai-nang	Thề Hiến Tài Năng	command	Chỉ Huy	S	100	\N	\N	Khi tập thể quân ta (2-3 người) chuẩn bị phát động Chiến Pháp chuẩn bị, sẽ có 75% xác suất nhận được 7.5%→15% Hồi Tâm và Ký Mưu, có thể đón 2 lần, duy trì 2 hiệp	ally_2_3	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{the-hien-tai-nang.png}	2026-01-17 16:17:07.981	2026-01-17 16:17:07.981
6	linh-dan-duong	Linh Dan Dương	troop	Binh chủng	S	100	innate	\N	Tiền bác Linh Khiến thành Linh Dan Dương dùng mạnh vô uy: Thống Soái toàn thể quân ta tăng 18→36 điểm, và trước khi bất đầu mỗi hiệp, can cứ vào sát thương binh dao toàn thể quân ta gây ra ở hiệp trước để nhận tỷ lệ Linh Dan Dương nhất định, được cộng dồn (Khi quân ta chịu sát thương mưu lược, sẽ tiêu hao Linh Dan Dương để chống đỡ 18%→36% sát thương Mưu Lược, số lượng Linh Dan Dương mỗi hiệp sẽ suy giảm 10%); Nếu Đao Khiếm thông linh, thì tỷ lệ chống đỡ sẽ tăng đến 20%→40%	ally_all	{shield}	{灵帝}	{}	innate	\N	{}	\N	needs_update	{linh-dan-duong.png}	2026-01-17 16:17:07.983	2026-01-17 16:17:07.983
5	bich-den-cuoi-cung	Đích Đến Cuối Cùng	active	Chủ Động	S	40	\N	\N	Giúp nhóm (2 người) quân ta hồi phục binh lực nhất định (tỉ lệ trị liệu 36%→72%, bị Thống Soái ảnh hưởng), đồng thời giúp 1 Võ Tướng có Võ Lực cao nhất quân ta phát động 1 lần tấn công Binh Dao lên 1 Võ Tướng phê địch (tỉ lệ sát thương 43%→86%); Võ Tướng có Trí Lực cao nhất phát động 1 lần tấn công Mưu Lược lên 1 Võ Tướng phê địch (tỉ lệ sát thương 43%→86%); Nếu người có Võ Lực cao nhất và người có Trí Lực cao nhất quân ta là cùng một người, thì tỉ lệ sát thương của 2 lần tấn công đều giảm còn 36%→72%	ally_2	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	complete	{bich-den-cuoi-cung.png}	2026-01-17 16:17:07.982	2026-01-21 03:55:51.479
3	chung-dong-van-ke	Chúng Động Vạn Kế	passive	Bị Động	S	100	\N	\N	Khi chiều tấn công thường, có 45% xác suất gây sát thương binh dao cho bên công kích (tỷ lệ sát thương 70%→140%) và khiến sát thương lần sau gây ra của hán giảm 20%→40%	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	complete	{chung-dong-van-ke.png}	2026-01-17 16:17:07.979	2026-01-21 03:59:22.982
169	co-vu	Băng Bó	active	Chủ Động	B	30	\N	\N	Trí Liệu ngẫu nhiên một quân ta (tỷ lệ Trí Liệu 80%→160%, bị Trí Lực ảnh hưởng)	ally_1	{cavalry,shield,archer,spear,siege}	{}	{}	inherit	\N	{}	\N	complete	{co-vu-1.png,co-vu-2.png}	2026-01-17 16:17:08.195	2026-01-21 04:29:07.151
7	tu-si-tien-phong	Tử Sĩ Tiên Phong	command	Chỉ Huy	S	100	innate	\N	Tiên bác Linh Cung thành Tử Sĩ Tiên Phong không sợ chết chóc: Trong chiến đấu, toàn thể quân ta miễn dịch trạng thái Bị Tấp Kích, và khi chịu sát thương, có 30% → 60% xác suất (chịu ảnh hưởng Thống Soái của người mang) kích hoạt hiệu quả sau: Nếu tỷ lệ binh lực thấp hơn kẻ tấn công thì sẽ cướp 10.5 → 21 điểm Thống Soái (chịu ảnh hưởng Thống Soái của người mang), nếu không sẽ giảm 1.5% → 3% tỷ lệ phát động Chiến Pháp Chủ Động của kẻ địch, duy trì 2 hiệp, có thể cộng dồn 4 lần; Nếu Khúc Nghĩa thông linh, sẽ cộng dồn 5 lần	ally_all	{}	{}	{}	innate	\N	{}	\N	needs_update	{tu-si-tien-phong.png}	2026-01-17 16:17:07.985	2026-01-17 16:17:07.985
8	lay-it-danh-nhieu	Lấy Ít Đánh Nhiều	passive	Bị Động	S	100	\N	\N	Chiến đấu hiệp thứ 2, 4, 6, hồi phục Binh Lực bản thân (tỉ lệ Trị Liệu 144%→288%, ảnh hưởng bởi Vũ Lực) và nâng cao bản thân 5%→10% Vũ Lực; Chiến đấu hiệp thứ 5, gây cho toàn thể quân địch sát thương Binh Dao (tỉ lệ sát thương 36%→72%)	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{lay-it-danh-nhieu.png}	2026-01-17 16:17:07.986	2026-01-17 16:17:07.986
11	nhat-cu-tiem-diet	Nhất Cư Tiêm Diệt	active	Chủ động	A	40	\N	\N	Chuẩn bị 1 hiệp, gây cho cả thể quân địch 1 lần tấn công Binh Đao (tỷ lệ sát thương 167.5%→335%), nếu trong trạng thái Bao Cát, sẽ khiến cho mục tiêu nhận thêm trạng thái Hỗn Loạn (tấn công và Chiến Pháp sẽ không phân biệt khi lựa chọn mục tiêu), duy trì 2 hiệp	enemy_all	{spear}	{}	{}	\N	\N	{}	\N	needs_update	{nhat-cu-tiem-diet.png}	2026-01-17 16:17:07.99	2026-01-17 16:17:07.99
14	toa-chi-no-tap	Tỏa Chí Nọ Tập	active	Chủ Động	A	25	\N	\N	Chuẩn bị 1 hiệp, phóng cho tập thể quân địch (2 người) trạng thái Suy Nhuộc (không thể gây ra sát thương), duy trì 1 hiệp; nếu mục tiêu đã trong trạng thái Suy Nhuộc sẽ đổi thành gây ra 1 lần Mạnh Kích (tỷ lệ sát thương 188%)(Xác suất phát động 25%→35%)	enemy_2	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{toa-chi-no-tap.png}	2026-01-17 16:17:07.993	2026-01-17 16:17:07.993
15	tai-ki-qua-nhan	Tái Kì Quá Nhân	command	Chỉ Huy	A	25	inherited	\N	Thêm trạng thái Yếu và gây sát thương bình dao có điều kiện	ally_2	{cavalry,shield,archer,spear,siege}	{}	{}	inherit	\N	{}	\N	needs_update	{tai-ki-qua-nhan.png}	2026-01-17 16:17:07.995	2026-01-17 16:17:07.995
198	thap-dien-mai-phuc	Thập Điền Mai Phục	active	Chủ Động	S	35	\N	\N	Gây cho nhóm địch (2 người) 2 hiệu Cấm Trị Liệu (không thể hồi Binh Lực) và trạng thái Đạo Phản (tỉ lệ sát thương 37%→74%, chịu ảnh hưởng bởi thuộc tính cao nhất của Vô Lực hoặc Trí Lực, bỏ qua phòng ngự), sau đó gây cho quân địch có trạng thái bất lợi sát thương Mưu Lược (tỉ lệ sát thương 48%→96%, chịu ảnh hưởng bởi Trí Lực)	enemy_2	{shield,siege}	{}	{}	\N	\N	{}	\N	needs_update	{thap-dien-mai-phuc.png}	2026-01-17 16:17:08.232	2026-01-17 16:17:08.232
10	danh-vao-cho-dong	Đánh Vào Chỗ Đông	active	Chủ Động	A	35	\N	\N	Gây cho tập thể quân địch (1-2 người) sát thương Binh Bao (tỷ lệ sát thương 82%→164%), và có 45% xác suất Trí Liệu bản thân (tỷ lệ Trí Liệu 44%→88%, bị Vỗ Lực ảnh hưởng)	enemy_1_2	{cavalry,shield,archer,spear}	{}	{}	inherit	\N	{}	\N	complete	{danh-vao-cho-dong.png}	2026-01-17 16:17:07.988	2026-01-21 07:13:47.312
9	day-cung-toi-luyen	Dày Công Tôi Luyện	passive	Bị động	S	100	inherited	\N	Trí liệu bản thân và tăng Võ Lực	self	{archer}	{}	{}	inherit	\N	{}	\N	complete	{day-cung-toi-luyen.png}	2026-01-17 16:17:07.987	2026-01-21 07:14:35.237
16	ky-ho-nam-ha	Kỳ Hổ Nam Hạ	command	Chỉ huy	A	100	innate	\N	Khi quân Đông Minh bị tấn công thương ngoại trừ bản thân, có 20%→35% xác suất gây ra trạng thái Cấm Trị Liệu trong hiệp hiện tại cho quân Đông Minh (không thể hồi phục Binh Lực) và gây cho tập thể quân địch (2 người) tấn công Binh Bạo (tỷ lệ sát thương 36%→72%)	ally_2	{cavalry,shield,archer}	{}	{}	innate	\N	{}	\N	needs_update	{ky-ho-nam-ha.png}	2026-01-17 16:17:07.996	2026-01-17 16:17:07.996
18	xuat-ky-bat-y	Xuất Kỳ Bất Ý	active	Chủ Động	A	20	\N	\N	Chuẩn bị 1 hiệp, gây cho tập thể quân địch (2 người) ngẫu nhiên hiệu ứng Kế Tấn (không thể phát động Chiến Pháp chủ động) hoặc Giao Bỉnh Khí ( không thể tiến hành tấn công thường), duy trì 1-2 hiệp (có 30% xác suất duy trì 2 hiệp) (Xác suất phát động 20%→35%)	enemy_2	{cavalry,shield,archer}	{}	{}	\N	\N	{}	\N	needs_update	{xuat-ky-bat-y-1.png,xuat-ky-bat-y-2.png}	2026-01-17 16:17:07.998	2026-01-17 16:17:07.998
20	than-thuong-thiet-chien	Thần Thương Thiết Chiến	active	Chủ Động	A	50	\N	\N	Gây cho toàn thể quân địch tấn công Mưu Lược (tỷ lệ sát thương 30%→60%, bị Trí Lực ảnh hưởng) và Chế Giáo (cướp chế mục tiêu tự tấn công thường bản thân), duy trì 1 hiệp	enemy_all	{cavalry,shield,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{than-thuong-thiet-chien-1.png,than-thuong-thiet-chien-2.png,than-thuong-thiet-chien-3.png}	2026-01-17 16:17:08.001	2026-01-17 16:17:08.001
21	muu-luoc-tung-hoanh	Mưu Lược Tung Hoành	active	Chủ động	A	45	\N	\N	Chuẩn bị 1 hiệp, gây cho tập thể quân địch (2 người) trang thái Đốt Cháy, Trúng Độc, mỗi hiệp này ra sát thương liên tục (tỷ lệ sát thương 29%-58%, bị Trí Lực ảnh hưởng), duy trì 2 hiệp	enemy_2	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{muu-luoc-tung-hoanh.png}	2026-01-17 16:17:08.002	2026-01-17 16:17:08.002
22	lu-giang-thuong-giap	Lữ Giang Thương Giáp	active	Chủ động	A	\N	inherited	\N	Tăng cho bản thân 22→44 Thông Soái, và Gánh Vác cho cả thế quân Đồng Minh 20%→40% sát thương, duy trì 2 hiệp	ally_all	{cavalry,shield,spear,siege}	{}	{吕旷,吕翔}	inherit	\N	{}	\N	needs_update	{lu-giang-thuong-giap.png}	2026-01-17 16:17:08.004	2026-01-17 16:17:08.004
23	thi-chi-bat-di	Thí Chí Bất Dĩ	passive	Bị Động	A	100	\N	\N	Hai hiệp đầu nhận trạng thái tấn công nhóm (tỷ lệ sát thương 50%→100%) nhưng chỉ có 50% xác suất phát động hiệu ứng tấn công nhóm (khi tấn công thường gây sát thương cho Vô Tướng khác cùng đội quan với mục tiêu), hiệp thứ 3 trở đi mỗi hiệp tăng 7.5→15 Vô Lực	enemy_all	{cavalry,spear}	{}	{}	\N	\N	{}	\N	needs_update	{thi-chi-bat-di.png}	2026-01-17 16:17:08.005	2026-01-17 16:17:08.005
24	than-thuong-su	Thần Thương Sứ	active	Chủ Động	A	50	\N	\N	Chuẩn bị 1 hiệp, Gây cho toàn thể quân địch trang thái Bỏ chạy, mỗi hiệp gây ra sát thương liên tục (tỷ lệ sát thương 64%~68%, bị Vô Lực ảnh hưởng), duy trì 2 hiệp	enemy_all	{cavalry,shield,siege}	{}	{}	\N	\N	{}	\N	needs_update	{than-thuong-su-1.png,than-thuong-su-2.png}	2026-01-17 16:17:08.007	2026-01-17 16:17:08.007
199	vuong-ta-chi-tai	Vương Tá Chi Tài	internal	Nội chính	S	100	\N	\N	Tăng 36→72 Chính Trị của Võ Tướng	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{vuong-ta-chi-tai.png}	2026-01-17 16:17:08.233	2026-01-17 16:17:08.233
17	duong-dong-kich-tay	Dương Đông Kích Tây	active	Chủ Động	A	40	inherited	\N	Chuẩn bị 1 hiệp, gây cho tập thể quân địch (2 người) tấn công Mưu Lược (tỷ lệ sát thương 87.5%→175%, bị Trí Lực ảnh hưởng) và giảm 15→30 điểm tốc độ, duy trì 2 hiệp	enemy_2	{cavalry,shield,spear,siege}	{}	{}	inherit	\N	{}	\N	complete	{duong-dong-kich-tay.png}	2026-01-17 16:17:07.997	2026-01-21 07:26:46.744
19	hau-phat-che-nhan	Hậu Phát Chế Nhân	passive	Bị động	A	100	innate	\N	Khi bị tấn công thường sẽ tiến hành 1 lần phản kích vào người tấn công (tỷ lệ sát thương 26%->52%)	enemy_1	{cavalry,shield,archer,spear,siege}	{}	{}	inherit	\N	{}	\N	complete	{hau-phat-che-nhan.png}	2026-01-17 16:17:08	2026-01-21 07:37:12.36
26	pha-tran-thoi-kien	Phá Trận Thôi Kiên	command	Chỉ Huy	S	100	\N	\N	Chuẩn bị 1 hiệp, làm cho tập thể quân địch (2 người) giảm 40→80 điểm Thống Soái và Trí Lực (bị Vũ Lực ảnh hưởng), duy trì 2 hiệp, và phát động 1 lần tấn công Binh Đao cho mục tiêu (tỷ lệ sát thương 79%→158%)	enemy_2	{}	{}	{}	\N	\N	{}	\N	needs_update	{pha-tran-thoi-kien-1.png,pha-tran-thoi-kien-2.png}	2026-01-17 16:17:08.009	2026-01-17 16:17:08.009
28	tu-dien-so-ca	Tử Điển Sơ Ca	active	Chủ Động	S	50	\N	\N	Chuẩn bị 1 hiệp, phóng trang thái Trung Độc cho tập thể quân địch (2 người), mỗi hiệp đây ra sát thương liên tục (tỷ lệ sát thương 72%->144%, bị Trí Lực ảnh hưởng), duy trì 2 hiệp	enemy_2	{spear,archer,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tu-dien-so-ca.png}	2026-01-17 16:17:08.012	2026-01-17 16:17:08.012
32	tram-sa-quyet-thuy	Trâm Sa Quyết Thúy	active	Chủ Động	S	40	\N	\N	Chuẩn bị 1 hiệp, thì triển trạng thái Thúy Công cho nhóm quân địch (2 người), mỗi hiệp duy trì gây sát thương (tỷ lệ sát thương 70%→140%, Trí Lực ảnh hưởng), và khiến sát thương Mưu Lược mục tiêu phải chịu tăng 25% (Trí Lực ảnh hưởng), duy trì 2 hiệp	enemy_all	{cavalry,shield,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tram-sa-quyet-thuy.png}	2026-01-17 16:17:08.018	2026-01-17 16:17:08.018
34	nhat-ky-duong-thien	Nhất Kỵ Đương Thiên	command	Chỉ Huy	S	40	\N	\N	Thêm trạng thái bỏng và tăng sát thương binh dao phạt nhận\n\nSau khi tấn công thường, phát động 1 lần tấn công Binh Dao cho toàn thể quân địch (tỷ lệ sát thương 36%→72%); khi bản thân là Chủ Tướng, lần tấn công Binh Dao này sẽ càng mạnh (tỷ lệ sát thương 54%→108%)	enemy_all	{cavalry,shield,spear,archer,siege}	{}	{}	\N	\N	{}	\N	needs_update	{nhat-ky-duong-thien-1.png,nhat-ky-duong-thien-2.png}	2026-01-17 16:17:08.021	2026-01-17 16:17:08.021
244	am-do-tran-thuong	Ám Độ Trần Thương	active	Chủ động	S	50	\N	\N	Chuẩn bị 1 hiệp, gây ra tấn công Mưu Lược cho cả thế quân địch (tỷ lệ sát thương 260%, bị Trí Lực ảnh hưởng) và làm cho mục tiêu rơi vào trạng thái Chấn Động (không thể hành động), duy trì 2 hiệp (Xác suất phát động 25% → 50%)	enemy_1	{cavalry,shield,archer,spear,siege}	{"Đặng Ngãi"}	{}	innate	\N	{}	\N	complete	{am-do-tran-thuong.png}	2026-01-17 16:17:08.288	2026-01-21 04:25:23.393
30	bat-mon-kim-toa-tran	Bát Môn Kim Tỏa Trận	formation	Pháp Trận	S	100	\N	\N	Chiến đấu 3 hiệp đầu, làm cho tập thể quân địch (2 người) gây ra sát thương giảm xuống 15%→30% (bị Trí lực ảnh hưởng), và làm cho tướng chính quân ta nhận trạng thái Tiên Công Trước (ưu tiên hành động)	enemy_2	{cavalry,shield,archer,spear,siege}	{}	{"Tào Nhân"}	inherit	\N	{}	\N	complete	{bat-mon-kim-toa-tran.png}	2026-01-17 16:17:08.014	2026-01-21 03:54:44.734
12	am-tang-huyen-co	Ám Tàng Huyền Cơ	assault	Đột Kích	A	40	\N	\N	Gây sát thương Binh dao và thêm trạng thái Hỗn loạn có điều kiện Độ điền tập 30%. Sau khi tấn công thường, lại phát động thêm 1 lần tấn công Binh Dao vào mục tiêu tấn công (tỷ lệ sát thương 72% →144%), nếu mục tiêu là tướng chính quân địch thì sẽ gây thêm 1 lần tấn công Mưu Lược (tỷ lệ sát thương 46% →92%, bị Trí Lực ảnh hưởng)	enemy_1	{cavalry,archer,spear,siege}	{"Hàn Toại"}	{"Hàn Toại"}	innate	\N	{}	\N	complete	{am-tang-huyen-co.png}	2026-01-17 16:17:07.991	2026-01-21 04:25:43.655
27	sy-bong-so-cau	Sợ Bóng Sợ Gió	active	Chủ động	S	50	\N	\N	Chuẩn bị hiệp 1, phát động 1 lần tấn công mưu lược (tỷ lệ sát thương 85%→170%, chịu ảnh hưởng Trí Lực) cho tập thể quân địch (2 người), và hồi phục Binh Lực nhất định cho tập thể quân ta (2 người) (Tỷ lệ hồi phục 60%→120%, chịu ảnh hưởng Trí Lực)	enemy_all	{shield,cavalry,archer,spear,siege}	{}	{"Vu Cát","Tả Từ"}	inherit	\N	{}	\N	complete	{sy-bong-so-cau.png}	2026-01-17 16:17:08.01	2026-01-21 07:44:46.652
33	du-bi-tham-nhap	Dụ Địch Thâm Nhập	active	Chủ Động	S	40	innate	\N	Chuẩn bị 1 hiệp, thi triển trạng thái Bão Cát cho nhóm quân địch (2 người), mỗi hiệp gây ra sát thương (tỷ lệ sát thương 70%→140%, Trí Lực ảnh hưởng) và khiến sát thương Bình Đao mục tiêu phải chịu tăng 25% (Trí Lực ảnh hưởng), duy trì 2 hiệp	enemy_2	{cavalry,shield,archer,spear,siege}	{}	{"Hoa Hùng","Tư Mã Huy"}	inherit	\N	{}	\N	complete	{du-bi-tham-nhap.png}	2026-01-17 16:17:08.019	2026-01-21 07:24:29.633
35	thua-dich-bat-ngu	Thừa Địch Bất Ngụ	active	Chủ động	S	50	\N	\N	Chuẩn bị 1 hiệp, khiến Tướng Chính quân địch rơi vào trạng thái Suy Nhược (không thể gây ra sát thương), duy trì 2 hiệp, và khiến Tướng Chính quân ta rơi vào trạng thái Nghỉ Ngơi (mỗi hiệp khôi phục 1 lần Binh Lực, tỷ lệ khôi phục 54%->108%, chịu ảnh hưởng Trí Lực), duy trì 2 hiệp	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{thua-dich-bat-ngu.png}	2026-01-17 16:17:08.022	2026-01-17 16:17:08.022
39	toa-nhue	Tóa Nhuệ	command	Chỉ huy	S	100	\N	\N	Chiến đấu 3 hiệp đầu, làm cho cả thể quân dịch rơi vào trạng thái Suy Nhuệ, khi gây ra sát thương có 32.5%-65% xác suất không thể gây ra sát thương	\N	{cavalry,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{toa-nhue.png}	2026-01-17 16:17:08.028	2026-01-17 16:17:08.028
40	thu-nhi-tat-co	Thủ Nhĩ Tật Cố	command	Chỉ Huy	S	100	\N	\N	Khi bắt đầu chiến đấu, Chế Giểu tướng chính quân địch (cường chế mục tiêu tự tấn công thường bản thân), và làm tăng Thống Soái của bản thân lên 30→60 điểm, duy trì 4 hiệp	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{thu-nhi-tat-co.png}	2026-01-17 16:17:08.029	2026-01-17 16:17:08.029
43	hoanh-qua-duoc-ma	Hoành Qua Dược Mã	command	Chỉ huy	S	100	\N	\N	3 hiệp đầu, sát thương mưu lược do tập thể hai phe gây ra giảm 15%→30%; Từ hiệp 3 trở đi, sát thương bình dao do toàn thể quân ta gây ra tăng 10%→20% (chịu ảnh hưởng tốc độ), duy trì đến kết thúc chiến đấu	ally_all	{}	{}	{"Lăng Thống"}	inherit	\N	{}	\N	complete	{hoanh-qua-duoc-ma-1.png,hoanh-qua-duoc-ma-2.png}	2026-01-17 16:17:08.033	2026-01-21 07:41:48.655
44	phong-tru-hoa-the	Phong Trứ Hóa Thể	active	Chủ Động	S	50	\N	\N	Gây cho cả thể quân địch sát thương Mưu Lược (tỷ lệ sát thương 77%→154%, bị Trí Lực ảnh hưởng); nếu mục tiêu ở trong trạng thái Bốt Cháy thì sẽ gây thêm cho mục tiêu 1 lần sát thương Mưu Lược (tỷ lệ sát thương 114%→228%, bị Trí Lực ảnh hưởng)	enemy_all	{}	{}	{}	\N	\N	{}	\N	needs_update	{phong-tru-hoa-the.png}	2026-01-17 16:17:08.034	2026-01-17 16:17:08.034
45	tri-ki	Trí Kị	command	Chỉ Huy	S	\N	\N	\N	Khiến nhóm quân địch (2 người) giảm 19~38 Vũ Lực, Trí Lực (bị Trí Lực ảnh hưởng), duy trì 2 hiệp, tối đa cộng dồn 2 lần	enemy_2	{cavalry}	{}	{}	\N	\N	{}	\N	needs_update	{tri-ki.png}	2026-01-17 16:17:08.035	2026-01-17 16:17:08.035
36	bach-ky-kiep-doanh	Bách Kỵ Kiếp Doanh	assault	Đột Kích	S	40	innate	\N	Sau khi tán công thương, phát động 1 lần tấn công Binh Dao cho cả thể quân địch ngẫu nhiên (tỷ lệ sát thương 81%→162%) đồng thời có 50% xác suất phát động thêm 1 lần tán công Binh Dao cho tướng chính quan địch (tỷ lệ sát thương 60%→120%)	enemy_1	{cavalry,shield}	{}	{"Cam Ninh"}	inherit	\N	{}	\N	complete	{bach-ky-kiep-doanh.png}	2026-01-17 16:17:08.023	2026-01-21 03:48:34.536
37	danh-bai-quan-dich	Đánh Bại Quân Địch	assault	Đột Kích	S	45	\N	\N	Sau khi tấn công thường, làm cho cả thế quân địch ngẫu nhiên giảm 100 điểm Thông Soái và Trí Lực, duy trì 2 hiệp; nếu bản thân không phải là Chủ Tướng, sẽ khiến tướng chính quân ta nhận thêm 2 lần Chống Đỡ, có thể miễn dịch sát thương, duy trì 2 hiệp	enemy_1	{cavalry,shield,archer,spear,siege}	{}	{"Điển Vi","Mã Siêu"}	inherit	\N	{}	\N	complete	{danh-bai-quan-dich.png}	2026-01-17 16:17:08.025	2026-01-21 07:13:28.743
38	hop-quan-tu-chung	Hợp Quân Tụ Chúng	command	Chỉ Huy	S	100	passive	\N	Trong chiến đấu, bản thân mỗi hiệp hồi phục Binh Lực nhất định (tỷ lệ Trí Liệu 62% - 124%, chịu ảnh hưởng thuốc tính cao hơn trong: Thống Soái hoặc Trí Lực)	self	{cavalry,shield,archer,spear,siege}	{}	{"Viên Thiệu","Từ Hoảng"}	inherit	\N	{}	\N	complete	{hop-quan-tu-chung.png}	2026-01-17 16:17:08.026	2026-01-21 07:42:42.146
41	khac-dich-che-thang	Khắc Địch Chế Thắng	assault	Đột Kích	S	40	\N	\N	Sau khi tấn công thường, gây thêm cho mục tiêu tấn công 1 lần sát thương Mưu Lượt (tỉ lệ sát thương 90%→180%, bị Trí Lực ảnh hưởng); nếu mục tiêu đang ở trong 1/3 trạng thái Bỏ Chạy, Trúng Độc hoặc Đốt Cháy, thì sẽ có 85% xác suất khiến mục tiêu rơi vào trạng thái Suy Nhược (không thể gây ra sát thương), duy trì 1 hiệp	enemy_1	{cavalry,shield,archer,spear,siege}	{}	{"Trinh Phổ","Vu Cấm"}	inherit	\N	{}	\N	complete	{khac-dich-che-thang-1.png,khac-dich-che-thang-2.png}	2026-01-17 16:17:08.03	2026-01-21 07:51:37.49
46	tam-lanh-song-gio	Tạm Lãnh Sông Giớ	command	Chỉ Huy	S	100	\N	\N	Sau khi bắt đầu chiến đấu 3 hiệp đầu, khiến Võ Tướng quân ta có Trí Lực cao nhất giảm 20%→40% sát thương Binh Đao phải chịu (bị Trí Lực ảnh hưởng), làm cho Võ Tướng quân ta có Võ Lực cao nhất giảm 20%→40% sát thương Mưu Lược phải chịu (bị Trí Lực ảnh hưởng)	ally_2	{cavalry,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tam-lanh-song-gio.png}	2026-01-17 16:17:08.036	2026-01-17 16:17:08.036
47	phong-thi-tran	Phong Thỉ Trận	command	Chỉ huy	S	100	inherited	\N	Trong quá trình chiến đấu, khiến sát thương thường quân ta gây ra tăng 15%→30%, sát thương phải chịu tăng 20%; sát thương Phó tướng quân ta gây ra giảm 15%, sát thương phải chịu giảm 12.5%→25%	ally_all	{archer,spear,shield}	{}	{马岱}	inherit	\N	{}	\N	needs_update	{phong-thi-tran.png}	2026-01-17 16:17:08.038	2026-01-17 16:17:08.038
49	me-hoac	Mê Hoặc	passive	Bị động	S	100	\N	\N	Khi bản thân nhận phải Công thường, có 22.5%→45% xác suất làm cho người công kích rơi vào Hỗn loạn (công kích và chiến pháp sẽ không phân biệt khi lựa chọn mục tiêu). Tàn kế (không thể phát động chiến pháp chủ động). Suy nhược (không thể gây ra sát thương), duy trì 1 hiệp, khi chính mình là nữ giới, phát động tỉ lệ thêm chịu ảnh hưởng của trí lực	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{me-hoac.png}	2026-01-17 16:17:08.04	2026-01-17 16:17:08.04
51	van-vu-song-toan	Vạn Vũ Song Toàn	passive	Bị động	S	100	\N	\N	Trong chiến đấu, mỗi lần bản thân gây ra sát thương Mưu Lược sẽ tăng 15→30 điểm Trí Lực, tối đa cộng dồn 5 lần (sau khi cộng dồn đủ 5 lần sẽ nhận thêm 10% Công Tâm); mỗi lần gây ra sát thương Binh Đạo sẽ tăng 15→30 điểm Vũ Lực, tối đa cộng dồn 5 lần (sau khi cộng dồn đủ 5 lần sẽ nhận thêm 10% Lâm Phận)	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{van-vu-song-toan.png}	2026-01-17 16:17:08.043	2026-01-17 16:17:08.043
53	linh-giap-may	Linh Giáp Mây	active	Chủ Động	S	100	innate	\N	Tiến bộ Linh Khiên thành Linh Giáp Mây dao thương đạn không thúng; sát thương Binh Đao toàn thể quân ta nhận vào giảm 12%. →24% (bị Thông Soái ảnh hưởng), nhưng khi rơi vào trạng thái Đốt Cháy thì mỗi hiệp sẽ tồn thất thêm Binh Lực (tỷ lệ sát thương 300%); nếu Ngột Đột Cốt làm thông linh sẽ giảm tồn thất Binh Lực khi ở trong trạng thái Đốt Cháy (tỷ lệ sát thương 250%)	ally_all	{}	{}	{}	innate	\N	{}	\N	needs_update	{linh-giap-may.png}	2026-01-17 16:17:08.045	2026-01-17 16:17:08.045
216	am-tien-nan-phong	Ám Tiễn Nan Phòng	active	Chủ Động	S	35	\N	\N	Chuẩn bị 1hiệp, phát động một lần tấn công Binh Dao với nhóm địch (2 người) (TL Sát thương 130%→260%); và có 30%→60% xác suất (bị ảnh hưởng bởi Tốc Độ) bắt một Vô Tướng quân địch (Hiệu ứng Gật không thể bị xóa bỏ), khiến nó không thể hành động và gây sát thương, cấm sử dụng Chi Huy và Chiến Pháp bị động, vào trạng thái Cấm Trị Liệu, và không bị Vô Tướng động minh	enemy_2	{cavalry,shield,archer,spear,siege}	{"Mã Trung"}	{}	innate	\N	{}	\N	complete	{am-tien-nan-phong.png}	2026-01-17 16:17:08.253	2026-01-21 04:25:52.217
48	dung-gia-hang-dau	Dũng Giả Hàng Đầu	assault	Đột Kích	S	45	\N	\N	Sau khi tấn công thường khiến bản thân nhận được 1 lần Chống Đỡ, có thể miễn dịch sát thương, và làm cho sát thương Chiến Pháp chủ động tiếp theo tăng 40%→80%	self	{cavalry,shield,archer,spear,siege}	{}	{"Trương Liêu","Trương Cơ"}	inherit	\N	{}	\N	complete	{dung-gia-hang-dau.png}	2026-01-17 16:17:08.039	2026-01-21 07:25:02.983
55	tay-luong-thiet-ky	Tây Lương Thiết Kỵ	command	Chỉ Huy	S	100	innate	\N	Tiền bạc: Linh Ký thành Tây Lương Thiết Kỵ tung hoành thiên hạ: Chiến đấu 3 hiệp đầu, tặng cho toàn thể quân ta 12.5%~25% Xác suất Hồi Tâm (khi kích hoạt sát thương Bình Bao tăng 100%); nếu Mã Đằng làm thống lĩnh, thì tăng xác suất Hồi Tâm sẽ bị tốc độ ảnh hưởng	ally_all	{cavalry}	{马超}	{}	innate	\N	{}	\N	needs_update	{tay-luong-thiet-ky.png}	2026-01-17 16:17:08.048	2026-01-17 16:17:08.048
58	vo-duong-phi-quan	Vô Đương Phi Quân	command	Chỉ Huy	S	100	innate	\N	Tiến bác Linh Cung thành Vô Đương Phi Quân Bạch Phát Bạch Trúng: Giúp Thông Soái, Tốc Độ của toàn quân ta tăng 11→22 điểm, hiệp đầy kèm thêm trạng thái Trung Độc cho nhóm địch (2 người), liên tục gây sát thương vào mỗi hiệp (tỉ lệ sát thương 40%→80%, bị ảnh hưởng bởi Trí Lực), duy trì 3 hiệp; Nếu Vương Bình Thông linh, kèm thêm trạng thái Trung Độc cho toàn quân địch	ally_all	{}	{}	{}	innate	\N	{}	\N	needs_update	{vo-duong-phi-quan-1.png,vo-duong-phi-quan-2.png}	2026-01-17 16:17:08.052	2026-01-17 16:17:08.052
61	tuyet-dia-phan-kich	Tuyệt Địa Phản Kích	passive	Bị động	S	100	\N	\N	Trong khi chiến đấu, bản thân sau mỗi lần nhận phải sát thương Binh Dao, Vô Lực tăng 3→6, tối đa cộng dồn 10 lần; khi ở hiệp thứ 5, đưa vào số lần cộng dồn gây cho toàn địch sát thương Binh Dao (tỷ lệ sát thương 60%→120%, mỗi lần tăng 7%→14% tỷ lệ sát thương)	\N	{shield,spear}	{}	{}	\N	\N	{}	\N	needs_update	{tuyet-dia-phan-kich.png}	2026-01-17 16:17:08.056	2026-01-17 16:17:08.056
62	si-biet-tam-nhat	Sĩ Biệt Tam Nhật	passive	Bị động	S	100	\N	\N	Chiến đấu 3 hiệp đầu, không thể tiến hành tấn công thường nhưng được nhận 15%→30% xác suất hiệu ứng Nộ Trảnh, hiệp thứ 4 sẽ tăng cho bản thân 34→68 điểm Trí Lực và gây cho toàn thể quân địch sát thương Mưu Lược (tỷ lệ sát thương 90%→180%, bị Trí Lực ảnh hưởng)	toi	{shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{si-biet-tam-nhat.png}	2026-01-17 16:17:08.057	2026-01-17 16:17:08.057
436	cong-huan-khac-cu	Công Huân Khắc Cử	internal	Nội chính	S	100	\N	\N	Khi ủy nhiệm Võ Tướng làm Quan Chủ Chính, sản lượng toàn tài nguyên tăng 1.3%→2.5%	self	{cavalry,shield,archer,spear,siege}	{"Trương Chiêu"}	{}	innate	\N	{}	\N	complete	{}	2026-01-18 17:20:47.835	2026-01-18 17:20:50.291
54	ham-tran-doanh	Hãm Trận Doanh	troop	Binh Chủng	S	100	innate	\N	Tiền bạc Linh Khiến thành Hãm Trận Doanh thuần buồm xuôi gió: Vô Lực, Thống Soái của toàn thể quân ta tăng 11→22 điểm, chiến đấu 3 hiệp đầu nhận trạng thái Cấp Cứu, khi nhận phải sát thương sẽ có 40% xác suất được Trị Liệu (tỷ lệ Trị Liệu 30%→60%, chịu Trí Lực ảnh hưởng); Nếu Cao Thuận thông linh, thì tỷ lệ kích hoạt Trị Liệu và tỷ lệ Trị Liệu sẽ chịu thêm Thống Soái ảnh hưởng	ally_all	{}	{}	{"Cao Thuận"}	inherit	\N	{}	\N	complete	{ham-tran-doanh-1.png,ham-tran-doanh-2.png}	2026-01-17 16:17:08.047	2026-01-21 07:37:03.265
59	hoanh-tao-thien-quan	Hoành Tảo Thiên Quân	active	Chủ Động	S	40	\N	\N	Gây cho toàn thể quân địch 50%→100% sát thương Binh Bao, nếu mục tiêu đã ở trong trạng thái Kể Tán hoặc Giao Binh Khí thì sẽ có 20%→30% xác suất làm cho mục tiêu rơi vào trạng thái Chấn Động (không thể hành động), duy trì 1 hiệp	enemy_all	{cavalry,shield,archer,spear,siege}	{}	{"Quan Vũ","Triệu Vân"}	inherit	\N	{}	\N	complete	{hoanh-tao-thien-quan.png}	2026-01-17 16:17:08.053	2026-01-21 07:42:09.399
56	ho-bao-ky	Hổ Báo Kỵ	troop	Binh chủng	S	100	innate	\N	Tiền bạc Linh Kỳ thành Hộ Bảo Kỵ thiên hạ tính nhứ: Toàn thể quân ta tăng 20→40VG Lực, chiến đấu 3 hiệp đầu, toàn thể quân ta tăng 5%→10% xác suất phát động Chiến Pháp đốt kích, nếu Tạo Thuẫn làm thống lĩnh, thì xác suất tăng phát động sẽ còn bị VG Lực ảnh hưởng	ally_all	{}	{}	{"Tào Thuần"}	inherit	\N	{}	\N	complete	{ho-bao-ky.png}	2026-01-17 16:17:08.049	2026-01-21 07:39:29.091
63	nguy-thu-tuong-gian	Nguy Thu Tướng Gian	command	Chủ Động	S	45	\N	\N	Gây cho cả thể quân địch sát thương Mưu Lược (tỷ lệ sát thương 103%→206%, bị Trí Lực ảnh hưởng), nếu mục tiêu trong trạng thái Hỗn Loạn thì sẽ khiến mục tiêu phát động tấn công vào cả thể quân Đông Minh (tỷ lệ sát thương 93%→186%, loại hình tùy thuộc hai hạng mục Vũ Lực, Trí Lực bên nào cao hơn), nếu không sẽ phòng trạng thái Hỗn Loạn (tấn công và Chiến Pháp sẽ không phân biệt khi lựa chọn mục tiêu), duy trì 1 hiệp.	enemy_all	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{nguy-thu-tuong-gian.png}	2026-01-17 16:17:08.058	2026-01-17 16:17:08.058
66	van-tien-te-phat	Vạn Tiễn Tề Phát	active	Chủ Động	S	\N	\N	\N	Chuẩn bị 1 hiệp, tạo tấn công binh dao cho toàn thể quân địch (Tỷ lệ sát thương 70% → 140%), và có 75% xác suất tạo trạng thái Bỏ Chạy, mỗi hiệp duy trì tạo sát thương (Tỷ lệ sát thương 60% → 120%, chịu ảnh hưởng Võ Lực), duy trì 1 hiệp	enemy_all	{archer}	{}	{}	\N	\N	{}	\N	needs_update	{van-tien-te-phat-1.png,van-tien-te-phat-2.png}	2026-01-17 16:17:08.062	2026-01-17 16:17:08.062
68	nghia-tam-chieu-liet	Nghĩa Tâm Chiêu Liệt	command	Chỉ huy	S	100	\N	\N	Trong chiến đấu, khi bản thân tạo hiệu ứng Trí Liệt, khiến sát thương Chiến Pháp chủ động mục tiêu phải chịu giảm 10%→20% (chịu ảnh hưởng Trí Lực), duy trì 1 hiệp; Khi Binh Lực của bản thân lần đầu tiên thấp hơn 40%→80%, khiến toàn thể quân ta khi chịu sát thương sẽ chia đều 25%→50% sát thương, duy trì 2 hiệp	ally_all	{cavalry,shield,archer,spear}	{}	{}	\N	\N	{}	\N	needs_update	{nghia-tam-chieu-liet.png}	2026-01-17 16:17:08.065	2026-01-17 16:17:08.065
69	nam-gai-nem-mat	Nam Gai Nêm Mật	command	Chỉ Huy	S	45	\N	\N	Phát động 1 lần tấn công Binh Dao vào tập thể quân địch (2 người) (tỷ lệ sát thương 48%~96%), và có 25% xác suất (cần cú vào số lượng trang thái Liên Kích, Quần Sát, Tiên Công Trước, Tất Trung, Phá Trận của bản thân, mỗi loại tăng 5%~10% xác suất) gây ra trạng thái Chấn Động (không thể hành động), duy trì 1 hiệp	enemy_2	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{nam-gai-nem-mat.png}	2026-01-17 16:17:08.066	2026-01-17 16:17:08.066
71	cat-xuong-tri-doc	Cắt Xương Trị Độc	active	Chủ Động	S	40	\N	\N	Xóa trạng thái xấu cho cả thể quân ta có tồn thất Binh Lực nhiều nhất và hồi phục Binh Lực cho mục tiêu (tỷ lệ Trí Liêu 128%→256%, bị Trí Lực ảnh hưởng)	ally_1	{}	{}	{"Hoa Đà"}	inherit	\N	{}	\N	complete	{cat-xuong-tri-doc.png}	2026-01-17 16:17:08.069	2026-01-21 04:27:24.719
67	dai-kich-si	Đại Kích Sĩ	troop	Binh Chủng	S	100	innate	\N	Tiền bác Linh Thường thành Đại Kích Sĩ Tùng Hoành Ngang Đọc: Vô Lực toàn thể quân ta tăng 7→14 điểm, khi tiến hành tấn công thường, có 35% xác suất gây cho 1 quân địch sát thương Binh Đao (tỷ lệ sát thương 61%→122%); Nếu Trương Cấp thông linh, thì xác suất phát động tăng 40%, và Trương Cấp nhận 22.5%→45% Liên Kích	ally_all	{shield}	{}	{"Trương Cáp"}	inherit	\N	{}	\N	complete	{dai-kich-si-1.png,dai-kich-si-2.png}	2026-01-17 16:17:08.063	2026-01-21 07:09:22.207
64	ke-hay-muu-gioi	Kê Hay Mưu Giới	command	Chỉ Huy	S	100	innate	\N	Ở 3 hiệp đầu trận, khiến Võ Tướng có Võ Lực cao nhất quân địch bị giảm sát thương Binh Đạo gây ra 16%→32% (bị tác độ ảnh hưởng), khiến Võ Tướng có Trí Lực cao nhất phe địch bị giảm sát thương Mưu Lược gây ra 16%→32%(bị tác độ ảnh hưởng)	ally_all	{cavalry,shield,archer,spear,siege}	{}	{"Tưởng Uyển"}	inherit	\N	{}	\N	complete	{ke-hay-muu-gioi-1.png,ke-hay-muu-gioi-2.png}	2026-01-17 16:17:08.059	2026-01-21 07:50:02.47
65	doat-hon-hiep-phach	Đoạt Hồn Hiệp Phách	active	Chủ động	S	55	\N	\N	Lấy trộm 19→38 Võ Lực, Trí Lực, Tốc Độ, Thống Soái của 1 quân địch (bị Trí Lực ảnh hưởng), duy trì 2 hiệp, được cộng dồn 2 lần	enemy_1	{cavalry,shield,archer,spear,siege}	{}	{"Thái Văn Cơ","Tiểu Kiều"}	inherit	\N	{}	\N	complete	{doat-hon-hiep-phach.png}	2026-01-17 16:17:08.061	2026-01-21 07:15:59.514
72	thuyen-co-muon-ten	Thuyền Cổ Mượn Tên	command	Chủ động	S	65	\N	\N	Xóa hiệu ứng tiêu cực cho một nhóm quân ta (2-3 người) và khiến một nhóm quân ta (2 người) nhận trạng thái Cấp cứu, mỗi khi chịu sát thương có 35% → 70% xác suất khôi phục lượng binh lực nhất định (lượng sát thương 14% → 28%, chịu ảnh hưởng của thống soái), duy trì 2 hiệp, sau khi phát động chiến pháp này sẽ vào 1 hiệp hồi chiêu	ally_2_3	{cavalry,shield,spear,siege}	{}	{黄忠}	inherit	\N	{}	\N	needs_update	{thuyen-co-muon-ten.png}	2026-01-17 16:17:08.07	2026-01-17 16:17:08.07
74	tuong-binh	Tượng Binh	command	Chỉ Huy	S	100	\N	\N	Tiền bạc Linh Kỳ thành Tượng Binh không gì kiêng sĩ: Điểm công thành cơ bản của đội quân tăng 25%. những Tốc độ hành quân hành quân giảm 50%, sẻ lũi 25%→50% sát thương nhận phải tiến hành tổng kết đạn trong vòng 3 hiệp, và sát thương tổng kết giảm 10%→20%, khi bản thân Đột Chấy sẻ nhận 50% tấn công nhóm và Hồn loạn; nếu Man tộc thông linh, cứ nhiều thêm 1 Man tộc thì sát thương tổng kết của Võ Tướng sẻ giảm thêm 5%→10%	ally_all	{}	{}	{}	\N	\N	{}	\N	needs_update	{tuong-binh.png}	2026-01-17 16:17:08.072	2026-01-17 16:17:08.072
75	quan-cam-pham	Quân Cấm Phạm	command	Chỉ Huy	S	100	innate	\N	Tiền bác Linh Cung thành Quân Cấm Phạm khi cải thiện phu: Khi đội quân tấn công thường, có 45% xác suất khiến mục tiêu rơi vào trạng thái Bó chạy (tỷ lệ sát thương 32%→64%, bị Võ Lực ảnh hưởng), duy trì 2 hiệp; nếu mục tiêu đã Bó chạy thì sẽ gây ra tấn công bình dao (tỷ lệ sát thương 55%→110%) và hồi phục Binh Lực tương đương 30%. Lượng sát thương; nếu Cạm Ninh thông linh, tăng 3%→6% Hội Tâm cho quân Đồng Minh	\N	{}	{}	{}	innate	\N	{}	\N	needs_update	{quan-cam-pham.png}	2026-01-17 16:17:08.074	2026-01-17 16:17:08.074
76	linh-thanh-chieu	Linh Thánh Chiếu	command	Chỉ Huy	S	100	\N	\N	Tiền bạc Linh Thượng thành Linh Thánh Chiếu xung kiện hủy nhuệ: Chiến đấu 2 hiệp đầu, khi một nhóm quân ta (2 người) bị công thường sẽ tiến hành 1 lần phản kích kẻ tấn công (tỉ lệ sát thương 36%→72%), khi hiệp thứ 3 bắt đầu sẽ lần lượt khôi phục binh lực của toàn thể quân ta, ưu tiên khôi phục hoàn toàn đơn thể có binh lực thấp nhất, sau đó mới khôi phục các đơn thể khác (tổng tỉ lệ trị liệu 90%→180%, chịu ảnh hưởng của Võ Lực, chịu thêm ảnh hưởng sát thương kẻ địch gây ra); nếu Tao Tháo thông linh, hiệu ứng trị liệu sẽ chịu thêm ảnh hưởng của Thống Soái	ally_2_3	{}	{}	{}	\N	\N	{}	\N	needs_update	{linh-thanh-chieu.png}	2026-01-17 16:17:08.075	2026-01-17 16:17:08.075
77	thiet-ky-khu-tri	Thiết Kỵ Khu Trì	command	Chỉ Huy	S	100	\N	\N	Chiến đấu 2 hiệp đầu, khiến toàn thể quân địch rơi vào trạng thái Bị Tập Kích (hành động chậm lại), sau khi toàn thể quân ta phát động Chiến Pháp Chủ Động hoặc Đột Kích, chọn ngẫu nhiên một Vỗ Tướng quân địch, nếu Binh Lực hiện tại của Vỗ Tướng quân địch này thấp hơn Tướng Chính quân ta, thì sẽ giảm 7.5%→15% Thông Soái của hắn, duy trì 3 hiệp, có thể cộng dồn	ally_all	{cavalry}	{}	{}	\N	\N	{}	\N	needs_update	{thiet-ky-khu-tri.png}	2026-01-17 16:17:08.076	2026-01-17 16:17:08.076
171	sat-thuong-them	Sát Thương Thêm	command	Chỉ Huy	B	\N	inherited	\N	Sau khi tấn công thương; gây cho mục tiêu tấn công trạng thái Cấm Trị Liệu (không thể hồi phục Binh Lực), duy trì 2 hiệp (Xác suất phát động 25%→40%)	enemy_1	{}	{}	{杜袭,庞德,阙宣}	inherit	\N	{}	\N	needs_update	{sat-thuong-them.png}	2026-01-17 16:17:08.197	2026-01-17 16:17:08.197
73	dep-dong-long-nguoi	Đẹp Động Long Người	active	Chủ Động	S	40	\N	\N	Chuẩn bị 1 hiệp, làm cho tập thể quân địch (1-2 người) rơi vào trạng thái Hỗn Loạn (tấn công và Chiến Pháp sẽ không phân biệt khi lựa chọn mục tiêu) và có 50% xác suất khiến Tập thể quân ta (2 người) giảm 8%→16% sát thương phải chịu, duy trì 2 hiệp, khi bản thân là nữ giới nhất định sẽ chọn tập thể quân địch (2 người) (Xác suất phát động 25%→40%)	enemy_1_2	{}	{}	{}	inherit	\N	{}	\N	complete	{dep-dong-long-nguoi.png}	2026-01-17 16:17:08.071	2026-01-21 07:14:56.079
80	luoi-duoi-gio-bay	Lưỡi Đuôi Gió Bay	active	Chủ Động	S	35	\N	\N	Gây cho một quân địch cộng kích mưu lược (tỉ lệ sát thương 113% →226%, chịu ảnh hưởng của trí lực) và trạng thái chân đông (không thể hành động) và có 40% xác suất khiến sát thương mưu lược mà mục tiêu phải chịu tăng 6%→12% (chịu ảnh hưởng của trí lực), duy trì 1 hiệp	enemy_1	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{luoi-duoi-gio-bay.png}	2026-01-17 16:17:08.08	2026-01-17 16:17:08.08
81	uy-muu-vo-dich	Uy Mưu Vô Địch	command	Chủ động	S	25	\N	\N	Chuẩn bị 1 hiệp, gây cho quân thế quân địch (2 người) trạng thái Yếu (không thể gây ra sát thương), duy trì 2 hiệp; nếu mục tiêu đã ở trạng thái Yếu sẽ khiến mục tiêu rơi vào trạng thái Đảo Phản, mỗi hiệp duy trì sát thương (tỉ lệ sát thương 79%→158%, chịu ảnh hưởng của một trong hai mục cao nhất giữa Võ Lực hoặc Trí Lực, bỏ qua phòng ngự) duy trì 2 hiệp (Xác suất phát động 25%→ 40%)	enemy_2	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{uy-muu-vo-dich.png}	2026-01-17 16:17:08.081	2026-01-17 16:17:08.081
82	pha-quan-uy-than	Phá Quân Uy Thần	active	Chủ Động	S	40	\N	\N	Giảm cửa một quân địch 35 → 70 điểm thống suất (chịu ảnh hưởng vô lực), duy trì 2 hiệp, và gây cho mục tiêu sát thương bình dao (tỉ lệ sát thương 114% → 228%)	enemy_1	{}	{}	{}	\N	\N	{}	\N	needs_update	{pha-quan-uy-than.png}	2026-01-17 16:17:08.082	2026-01-17 16:17:08.082
83	mau-gom-loi-the	Mau Gớm Lợi Thế	command	Chỉ Huy	S	35	\N	\N	Sau khi công kích phổ thông, phát động 1 lần công kích bình đạo cho mục tiêu (tỷ lệ sát thương 92.5% →185%); và Kế tấn (không thể phát động chiến pháp chủ động) 1 hiệp	enemy_1	{cavalry,shield}	{}	{马超}	inherit	\N	{}	\N	needs_update	{mau-gom-loi-the.png}	2026-01-17 16:17:08.084	2026-01-17 16:17:08.084
84	nhanh-chan-tranh-dat	Nhanh Chân Tranh Đất	passive	Bị Động	S	100	\N	\N	Tăng 10%→20% sát thương chiến pháp chủ động từ mạng, trước khi phát động thành công chiến pháp từ mạng, sẽ có 50% xác suất gây sát thương Binh Bảo cho một nhóm quân địch (2-3 người) (tỉ lệ sát thương 80%→120%)	enemy_2_3	{cavalry,archer,siege}	{}	{}	\N	\N	{}	\N	needs_update	{nhanh-chan-tranh-dat.png}	2026-01-17 16:17:08.085	2026-01-17 16:17:08.085
197	vung-nhu-thanh-dong	Vũng Như Thành Đồng	active	Chủ động	S	45	\N	\N	Khiến bản thân nhận trạng thái Quan Sát (miễn dịch tất cả hiệu ứng Không chế) và Chế Giáu toàn thể quân địch (cướp chế mục tiêu tấn công thường bản thân), đồng thời tặng cho bản thân 75→150 Thông Soái (chịu ảnh hưởng Thông Soái), duy trì 2 hiệp. (Xác suất phát động 35%→45%)	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{vung-nhu-thanh-dong.png}	2026-01-17 16:17:08.23	2026-01-17 16:17:08.23
79	co-hieu-tran	Cơ Hình Trận	formation	Pháp Trận	S	100	innate	\N	Chiến đấu 3 hiệp đầu, khiến Chủ Tướng phẻ dịch giảm 20% → 40% sát thương gây ra (Vỗ Lực ảnh hưởng), và khiến phó tướng ngẫu nhiên của phẻ ta giảm 10% → 20% sát thương Binh Dao phải chịu, phó tướng còn lại giảm 10% → 20% sát thương Mưu Lược phải chịu	enemy_1	{cavalry,shield,archer,spear,siege}	{}	{}	inherit	\N	{}	\N	complete	{co-hieu-tran.png}	2026-01-17 16:17:08.078	2026-01-21 04:28:48.938
87	doc-xa-tinh-ke	Dốc Sức Tính Kế	active	Chủ Động	S	55	\N	\N	Khiến 1 quân địch có Trí Lực cao nhất giảm 20% Trí Lực, và có 70% xác suất khiến tỉ lệ phát động Chiến Pháp Chủ Động phí tư mạng của bản thân tăng 100% trong hiệp này, duy trì 1 hiệp (Xác suất phát động 30%→55%)	self	{cavalry,shield,archer,spear,siege}	{}	{"Trương Nhượng"}	inherit	\N	{}	\N	complete	{doc-xa-tinh-ke.png}	2026-01-17 16:17:08.089	2026-01-21 07:22:12.475
85	ke-hoach-quyet-doan	Kế Hoạch Quyết Đoán	active	Chủ Động	S	50	innate	\N	Tăng sát thương chiến pháp chủ động tư mang	enemy_1	{cavalry,shield,archer,spear,siege}	{}	{"Hứa Du"}	inherit	\N	{}	\N	complete	{ke-hoach-quyet-doan.png}	2026-01-17 16:17:08.086	2026-01-21 07:50:44.085
105	khi-lang-tam-quan	Khí Lăng Tam Quân	passive	Bị Động	S	100	\N	\N	Khi bị tấn công thường sẽ tiến hành 1 lần phản kích người tấn công (tỷ lệ sát thương 26%→52%), Khi bạn thân là Phố Tướng, tỷ lệ sát thương tăng lên 37%→74%	enemy_1	{cavalry,shield,archer,siege}	{}	{}	exchange	\N	{}	\N	complete	{khi-lang-tam-quan.png}	2026-01-17 16:17:08.114	2026-01-21 07:51:59.02
88	thoi-co-chien-thang	Thời Cơ Chiến Thắng	command	Chỉ Huy	S	55	\N	\N	Thi triển trang thái Trung Độc cho tập thể quân địch (2 người), mỗi hiệp duy trì gây ra sát thương (tỷ lệ sát thương 60%→120%, chịu ảnh hưởng Trí Lực), duy trì 2 hiệp, nếu quân địch đã có trang thái Trúng Độc, sẽ ngẫu nhiên nhận được 1 trong các trang thái Bốt Chảy (chịu ảnh hưởng Trí Lực), Đào Phán (Chịu ảnh hưởng từ thuộc tính cao hơn giữa Võ Lực hoặc Trí Lực, bỏ qua phòng ngự), Bão Cát (chịu ảnh hưởng Trí Lực), mỗi hiệp duy trì gây ra sát thương (tỷ lệ sát thương 60%→120%), duy trì 2 hiệp, sau khi phát động Chiến Pháp này sẽ vào CD 1 hiệp	enemy_2	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{thoi-co-chien-thang.png}	2026-01-17 16:17:08.09	2026-01-17 16:17:08.09
89	trung-dung-nghia-liet	Trung Dũng Nghĩa Liệt	command	Chỉ Huy	S	\N	\N	\N	Trong chiến đấu, bản thân mỗi hiệp có 30%→60% tỷ lệ nhận hiệu quả sau: Tỷ lệ phát động chiêu pháp chủ động tăng 3%→6% (chịu ảnh hưởng Vô Lực); Vô Lực, Thống Soái, Trí Lực tăng 22.5→45; 14%→28% Lam Phân, duy trì 1 hiệp, mỗi loại hiệu quả sẽ được tính riêng	self	{cavalry,shield,archer,siege}	{}	{关羽}	inherit	\N	{}	\N	needs_update	{trung-dung-nghia-liet.png}	2026-01-17 16:17:08.091	2026-01-17 16:17:08.091
90	nhan-luan-loi-doan	Nhân Luân Lợi Doãn	active	Chủ Động	S	30	\N	\N	Khiến quân thế quân ta (2-3 người) nhận 12.5%→25% Né Tránh (Chịu ánh hưởng của mục cao hơn trong: Tốc Độ hoặc Thống Soái), duy trì 1 hiệp, sau khi phát động Chiến Pháp này sẽ vào 1 hiệp CD (Xác suất phát động 30%→55%)	enemy_2_3	{cavalry}	{}	{}	\N	\N	{}	\N	needs_update	{nhan-luan-loi-doan.png}	2026-01-17 16:17:08.094	2026-01-17 16:17:08.094
92	thuong-binh-phat-muu	Thượng Binh Phật Mưu	command	Chỉ Huy	S	40	\N	\N	Lần lượt phát động 1 lần tấn công Mưa Lước cho Võ Tướng quân địch có Binh Lực thấp nhất, Võ Lực cao nhất và Trí Lực thấp nhất, (Tỷ lệ sát thương 64%→128%, Trí Lực ảnh hưởng)	enemy_all	{cavalry,archer,siege}	{}	{}	\N	\N	{}	\N	needs_update	{thuong-binh-phat-muu.png}	2026-01-17 16:17:08.097	2026-01-17 16:17:08.097
93	phi-hung-quan	Phi Hùng Quân	command	Chỉ Huy	S	100	innate	\N	Tiến bậc Linh Kỳ thành Phi Hùng Quân dùng bất kỳ đường: Toàn quân ta tăng 8%→16% hiệu quả trị liệu nhận được, khi Tướng Chính phẻ ta hành động mỗi hiệp, có 60% xác suất gây sát thương Mưu Lược cho nhóm quân địch (2 người) (Tỷ lệ sát thương 32%→64%, chịu ảnh hưởng bởi lượng trị liệu tích lũy ma toàn thể quân ta tạo ra, sau khi kích hoạt sẽ đạt lại tiến độ tích lũy); Nếu Đông Trác thông linh, sẽ tăng 10%→20% hiệu quả trị liệu nhận được	\N	{}	{}	{}	innate	\N	{}	\N	needs_update	{phi-hung-quan.png}	2026-01-17 16:17:08.098	2026-01-17 16:17:08.098
95	lam-nguy-cuu-chu	Lâm Nguy Cứu Chủ	command	Chỉ Huy	S	100	\N	\N	Trong chiến đấu, toàn quân ta cứ tấn công thường 2 lần, có 25%→50% xác suất (chịu ảnh hưởng tốc độ) trị liệu cho 1 mục tiêu quân ta (xác suất Trị Liệu 42.5%→85%, chịu ảnh hưởng bởi chỉ số cao hơn trong Võ Lực hoặc Trí Lực), và khiến sát thương Mưu Lược mà đơn vị có binh lực thấp nhất quân ta phải chịu giảm 6%→12% (chịu ảnh hưởng tốc độ), có thể cộng dồn, duy trì 1 hiệp	ally_all	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{lam-nguy-cuu-chu.png}	2026-01-17 16:17:08.101	2026-01-17 16:17:08.101
91	gio-tap-mua-sa	Gió Táp Mưa Sa	active	Chủ Động	S	40	\N	\N	Gây ra cho Võ Tướng phế địch ngẫu nhiên 3-4 lần tấn công Binh Bảo (tỉ lệ sát thương 39%→78%, mỗi lần tăng 6%), từ lần thứ 3 trở đi, sẽ kèm thêm trạng thái Cấm Trí Liệu	enemy_1	{cavalry,shield,archer,spear,siege}	{}	{"SP Trương Lương"}	inherit	\N	{}	\N	complete	{gio-tap-mua-sa.png}	2026-01-17 16:17:08.095	2026-01-21 07:31:47.258
97	toan-quan-dot-kich	Toàn Quân Đột Kích	command	Chỉ Huy	S	100	\N	\N	Trong chiến đấu, bản thân mỗi hiệp có 18%→36% xác suất (chịu ảnh hưởng Trí Lực toàn thể quân ta) Trí Liêu Vô Tướng có binh lực ít nhất phe ta (tỷ lệ Trí Liêu 48%→96%, chịu ảnh hưởng Trí Lực), và gây 1 lần sát thương Mưu Lược cho cả thể quân địch ngẫu nhiên (tỷ lệ sát thương 48%→96%, chịu ảnh hưởng Trí Lực)	ally_all	{cavalry,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{toan-quan-dot-kich.png}	2026-01-17 16:17:08.104	2026-01-17 16:17:08.104
99	xong-pha-khoi-lua	Xông Pha Khởi Lửa	command	Chỉ huy	S	100	\N	\N	Hiệp đấu thứ 2-6 hiệp, mỗi hiệp có 25%→50% xác suất (bị ảnh hưởng bởi Thông Soái) giúp nhóm quân ta (2-3 người) nhận được 1 lần Chồng Đỏ và đưa nó vào trạng thái Nghiêm ngặt (Nghiêm ngặt: Có thể cộng dồn lượt Chồng Đỏ trong thời gian duy trì, và thời gian Chồng Đỏ kéo dài 8 hiệp), duy trì 2hiệp	ally_2_3	{cavalry,shield}	{}	{}	\N	\N	{}	\N	needs_update	{xong-pha-khoi-lua.png}	2026-01-17 16:17:08.106	2026-01-17 16:17:08.106
100	nhanh-tri-dong-nao	Nhanh Trí Động Não	active	Chủ Động	S	30	\N	\N	Khiến Trí Lực, Thống Soái, Mị Lực nhóm quân ta (2-3 người) tăng 7.5→15 (chịu ảnh hưởng bởi Trí Lực), có thể cộng dồn, duy trì 2-3 hiệp (Xác suất phát động 30%→55%)	ally_2_3	{cavalry,siege}	{}	{}	\N	\N	{}	\N	needs_update	{nhanh-tri-dong-nao.png}	2026-01-17 16:17:08.108	2026-01-17 16:17:08.108
104	thai-binh-dao-phap	Thái Bình Đạo Pháp	passive	Bị động	S	100	\N	\N	Nhận 14%→28% Kỵ Mưu và tăng xác suất phát động Chiến Pháp chủ động bản thân mang theo (3%→6%, nếu là Chiến Pháp chuẩn bị thì sẽ tăng 6%→12%, bị Trí Lực ảnh hưởng), khi bản thân là Chủ Tướng Quân Khán Vàng sẽ khiến Phó Tướng Quân Khán Vàng cũng được tăng xác suất phát động Chiến Pháp bản thân mang theo	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{thai-binh-dao-phap-1.png,thai-binh-dao-phap-2.png}	2026-01-17 16:17:08.113	2026-01-17 16:17:08.113
102	che-giau-tam-tu	Che Giấu Tâm Tư	command	Chỉ Huy	S	100	inherited	\N	Khi bắt đầu chiến đấu, có 17.5%→35% xác suất (chênh lệch Trí Lực giữa hai bên ảnh hưởng) khiến toàn thể quân địch rơi vào trạng thái Kế Tấn, mỗi mực tiểu phần đoán độc lập, duy trì 1 hiệp. Chiến đấu hiệp thứ 2, khiến các Võ Tướng phê địch có Trí Lực thấp hơn bản thân giảm 15%→30% sát thương Chiến Pháp Chủ Động (chênh lệch Trí Lực giữa hai bên ảnh hưởng), duy trì 3 hiệp	enemy_all	{cavalry,shield,archer,spear,siege}	{}	{}	inherit	\N	{}	\N	complete	{che-giau-tam-tu.png}	2026-01-17 16:17:08.11	2026-01-21 03:59:04.439
96	cong-bat-duong-quyen	Công Bất Đường Quyên	passive	Bị Động	S	100	innate	\N	Trong chiến đấu, sát thương Chiến Pháp Chủ Động từ mang của bản thân tăng 15%→30% và nhận 15%→30% Công Tâm, từ hiệp thứ 2 trở đi, trang thái tiêu cực do bản thân gây ra có 35%→70% xác suất (ảnh hưởng bởi Trí Lực) không thể bị giải trừ	self	{cavalry,shield,archer}	{}	{"SP Hoàng Nguyệt Anh"}	inherit	\N	{}	\N	complete	{cong-bat-duong-quyen-1.png,cong-bat-duong-quyen-2.png,cong-bat-duong-quyen-3.png,cong-bat-duong-quyen-4.png}	2026-01-17 16:17:08.102	2026-01-21 06:58:34.936
103	cuong-no-ket-hop	Cương Nhu Kết Hợp	command	Chỉ Huy	S	100	\N	\N	Mỗi khi bắt đầu hiệp, có 30%→60% xác suất (thuộc tính cao nhất ảnh hưởng) khiến Vũ Tướng bình lực thấp nhất phế ta giảm 3%→6% sát thương phải chịu (thuộc tính cao nhất ảnh hưởng), và 30%→60% xác suất (thuộc tính cao nhất ảnh hưởng) khiến Vũ Tướng bình lực cao nhất phế địch giảm 3%→6% sát thương gây ra (thuộc tính cao nhất ảnh hưởng), có thể cộng dồn, duy trì 2 hiệp. Khi bản thân hành động mỗi hiệp, có 17.5%→35% xác suất (thuộc tính cao nhất ảnh hưởng) khiến toàn quân ta miễn dịch Cấm Trị Liệu, mỗi mục tiêu phán đoạn độc lập, duy trì 1 hiệp	ally_1	{archer,siege}	{}	{}	\N	\N	{}	\N	complete	{cuong-no-ket-hop.png}	2026-01-17 16:17:08.112	2026-01-21 07:09:02.556
101	dong-long-hop-suc	Đồng Lòng Hợp Sức	active	Chủ động	S	50	\N	\N	Thực hiện ngẫu nhiên 1-4 lần: Trị Liệu một quân ta (ưu tiên Trí Liệu 51%→102%, Trí Lực ảnh hưởng), đồng thời khiến mục tiêu tăng 8→16 Thống Soái (Trí Lực ảnh hưởng), có thể cộng dồn, duy trì 2 hiệp	ally_1	{cavalry,shield,archer,spear}	{}	{}	exchange	\N	{}	\N	complete	{dong-long-hop-suc.png}	2026-01-17 16:17:08.109	2026-01-21 07:23:15.128
106	quy-than-dinh-uy	Quỷ Thần Định Uy	assault	Đột Kích	S	35	\N	\N	Sau khi tấn công thường, lại phát động 1 lần tấn công Binh Đao vào mục tiêu tấn công (tỷ lệ sát thương 102%→204%), khi bản thân là Chủ Tướng và Binh Lục mục tiêu thấp hơn 50%, sẽ tăng thêm sát thương (bị Binh Lực tổn thất của mục tiêu ảnh hưởng, tối đa tăng 25%→50%)	\N	{spear}	{}	{}	\N	\N	{}	\N	needs_update	{quy-than-dinh-uy.png}	2026-01-17 16:17:08.115	2026-01-17 16:17:08.115
107	thieu-dot-doanh-luy	Thiêu Đốt Doanh Lủy	command	Chỉ Huy	S	40	\N	\N	Gây cho tập thể quân địch (2 người) sát thương Mưu Lược (tỷ lệ sát thương 73%→146%, bị Trí Lực ảnh hưởng) và làm cho mục tiêu rơi vào trạng thái Cấm Trí Liệu (không thể hồi phục Binh Lực), duy trì 1 hiệp	enemy_2	{}	{}	{}	\N	\N	{}	\N	needs_update	{thieu-dot-doanh-luy.png}	2026-01-17 16:17:08.117	2026-01-17 16:17:08.117
109	lua-lan-khap-chon	Lửa Lan Khắp Chốn	command	Chỉ huy	S	100	\N	\N	Phóng cho tập thể quân địch (2-3 người) trạng thái Đốt Cháy, mỗi hiệp gây ra sát thương liên tục (tỷ lệ sát thương 28%→56%, bị Trí Lực ảnh hưởng), duy trì 2 hiệp; nếu mục tiêu đã có trạng thái Đốt Cháy sẽ gây ra tấn công Binh Dao (tỷ lệ sát thương 59%→118%)	enemy_2_3	{cavalry,shield,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{lua-lan-khap-chon.png}	2026-01-17 16:17:08.119	2026-01-17 16:17:08.119
110	tam-the-tran	Tam Thế Trận	command	Chỉ Huy	S	100	\N	\N	Khi phe của 3 Vũ Tướng quân ta đều khác nhau, và Chiến Pháp mang theo của Tướng Chính phe ta là Chiến Pháp Chủ Động hoặc Chiến Pháp Đột Kích, thì ở 5 hiệp đầu, Tướng Chính tăng 8%→16% xác suất dùng Chiến Pháp Chủ Động/Đột Kích mang theo; Trước mỗi hiệp hành động, giúp sát thương phái chủ của Phó Tướng có tồn tại bình lực khả nhiều giảm 15%→30%, sát thương gây ra bởi Phó Tướng còn lại tăng 12.5%→25%, duy trì 1 hiệp	ally_all	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tam-the-tran.png}	2026-01-17 16:17:08.121	2026-01-17 16:17:08.121
112	vo-dich-can-truong	Vô Địch Can Trường	passive	Bị động	S	100	\N	\N	Trong quá trình chiến đấu, sau khi chịu sát thương Binh Đạo, hiệp sau khi hành động sẽ tăng 10%→20%. Hồi Tâm và khiến sát thương lần tấn công tiếp theo tăng 32.5%→65%, duy trì 1 hiệp	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{vo-dich-can-truong.png}	2026-01-17 16:17:08.124	2026-01-17 16:17:08.124
136	ta-huu-khai-cung	Tá Hữu Khai Cung	active	Chủ Động	A	35	\N	\N	Tăng cho bản thân 6.5%→13% xác suất Hội Tâm (khi kích hoạt sát thương Binh Đao tăng 100%), gây cho cả thể quân địch 1 lần tấn công Binh Đao (tỷ lệ sát thương 90%→100%), nếu mục tiêu là Linh Ký sẽ gây thêm trạng thái Bỏ Chạy, mỗi hiệp đây ra sát thương liên tục (tỷ lệ sát thương 45%→90%, bị Võ Lực ảnh hưởng), duy trì 2 hiệp	\N	{archer}	{}	{}	\N	\N	{}	\N	needs_update	{ta-huu-khai-cung.png}	2026-01-17 16:17:08.154	2026-01-17 16:17:08.154
114	huyet-dao-tranh-gianh	Huyết Đao Tranh Giành	passive	Bị động	S	100	innate	\N	Trong chiến đấu, tăng 37.5%→75% sát thương tấn công thường, sau khi công thương sẽ gây hiệu ứng Say Đấu lên mục tiêu, mỗi hiệu ứng tối đa kích hoạt 1 lần. Nếu trên người mục tiêu có 3 lượt hiệu ứng Say Đấu, sẽ tiêu hao toàn bộ hiệu ứng Say Đấu và tăng sát thương tấn công thương cho bản thân (5.5%→11% × lượt Say Đấu), hiệu quả tăng thêm không thể cộng dồn, duy trì đến khi kết thúc chiến đấu	self	{cavalry,shield,archer,spear,siege}	{}	{}	exchange	\N	{}	\N	complete	{huyet-dao-tranh-gianh.png}	2026-01-17 16:17:08.126	2026-01-21 07:46:03.907
113	don-ky-cuu-chu	Dẫn Huyền Lực Chiến	passive	Bị Động	S	100	\N	\N	Sau khi tấn công thường, có 45% xác suất nhận trạng thái tấn công nhóm (Khi tấn công thường, gây cho Vô Tướng khác cùng đội quan mục tiêu sát thương)(tỷ lệ sát thương 26% → 52%), nếu đã vào trạng thái tấn công nhóm, thì sẽ tăng 8 → 16 Vô Lực, duy trì 3 hiệp, tối đa cộng dồn 6 lần	self	{cavalry,spear,shield}	{}	{}	exchange	\N	{}	\N	complete	{don-ky-cuu-chu.png}	2026-01-17 16:17:08.125	2026-01-21 07:22:40.856
111	bao-phong-thoi-vu	Đương Phong Thôi Quyết	assault	Đột Kích	S	35	inherited	\N	Sau khi tấn công thường, lại phát động thêm 1 lần tấn công Mưu Lược (tỷ lệ sát thương 91%→182%, bị Trí Lực ảnh hưởng), và Nguy Báo (Cấm dùng Chiến Pháp bị động và Chiến Pháp chỉ huy) 1 hiệp	enemy_1	{cavalry,shield,archer,spear,siege}	{}	{}	exchange	\N	{"Tống Hiến","Nhan Lương"}	\N	complete	{bao-phong-thoi-vu.png}	2026-01-17 16:17:08.122	2026-01-21 07:27:20.827
115	quyet-thuy-hoi-thanh	Quyết Thủy Hội Thành	command	Chỉ Huy	S	45	\N	\N	Chuẩn bị 1 hiệp, gây cho một nhóm quân địch (2-3 người) trạng thái Phá Hoại (cảm dụng tuyệt kỹ trạng bị) và Thủy Công, mỗi hiệp này sẽ gây sát thương liên tục (tỷ lệ sát thương 56%→112%, bị Trí Lực ảnh hưởng), duy trì 2 hiệp, nếu chiến pháp này phát động trong hiệp đầu sẽ không cần chuẩn bị	enemy_2_3	{}	{}	{}	\N	\N	{}	\N	needs_update	{quyet-thuy-hoi-thanh.png}	2026-01-17 16:17:08.127	2026-01-17 16:17:08.127
116	la-y-huyet-chien	Lá Y Huyết Chiến	passive	Bị Động	S	100	\N	\N	Trong chiến đấu không thể phát động Chiến Pháp chủ động, chiến đấu 3 hiệp đầu, nhận 45%→90% Liên Kích và 5%→10% Lăm Phan, và khiến bản thân và cả thể quân địch giảm 40% Thống Soái	\N	{cavalry,shield,spear,archer,siege}	{}	{}	\N	\N	{}	\N	needs_update	{la-y-huyet-chien.png}	2026-01-17 16:17:08.129	2026-01-17 16:17:08.129
117	so-trang-chien-kich	Sở Trang Chiến Kích	command	Chỉ Huy	S	100	innate	\N	Khiến Tướng Chính quân địch chịu sát thương bình dao tăng 7.5% →15%, Trí Lực của Phó Tướng có Võ Lực cao nhất giảm 50→100 điểm (Khi bản thân là nữ Tướng, chịu ảnh hưởng Mị Lực), duy trì 1 hiệp, chiến đấu từ hiệp thứ 2 trở đi, khi phát động sẽ khiến 2 người này phát động thêm 1 lần tấn công bình dao lần nhau (tỷ lệ sát thương 77.5%→155%)	\N	{cavalry,shield,archer,spear,siege}	{}	{}	innate	\N	{}	\N	needs_update	{so-trang-chien-kich.png}	2026-01-17 16:17:08.13	2026-01-17 16:17:08.13
121	tuyet-ky-cap-dao	Tuyệt Kỹ Cấp Đao	active	Chủ Động	S	50	\N	\N	Chuẩn bị 1 hiệp, gây cho một nhóm quân địch (2-3 người) gây ra một lần công kích binh đao (tỉ lệ sát thương 81%→162%), khiến họ vào trạng thái cấm trì liêu (không thể khôi phục binh lực), duy trì 1 hiệp	enemy_2_3	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tuyet-ky-cap-dao.png}	2026-01-17 16:17:08.135	2026-01-17 16:17:08.135
123	cuoi-ngua-nghin-dam	Cuỡi Ngựa Nghìn Dặm	passive	Bị Động	S	100	\N	\N	Trong chiến đấu, khi bản thân dùng Chiến Pháp Chuẩn Bị tự mang, sẽ có 35%→70% (Võ Lực ảnh hưởng) xác suất nhận trạng thái Quan Sát (miễn dịch tất cả hiệu ứng Khống Chế), đồng thời tăng 25→50 Võ Lực, duy trì 2 hiệp; Trong thời gian này, khi bản thân bị tấn công thường, sẽ tiến hành một lần phản kích với kẻ tấn công (tỉ lệ sát thương 119%→238%), mỗi hiệp tối đa kích hoạt 1 lần	self	{cavalry,shield,archer,spear,siege}	{}	{}	exchange	\N	{}	\N	complete	{cuoi-ngua-nghin-dam.png}	2026-01-17 16:17:08.138	2026-01-21 07:08:31.073
119	doc-hanh-pha-dich	Độc Hành Phó Đấu	active	Chủ Động	S	50	\N	\N	Chế Giểu toàn thể quân địch (cuồng chế mục tiêu tấn công thường vào mình), đồng thời tăng cho bạn thân 20%→40% Thống Soái, nếu quân địch đã bị Chế Giểu, thì bạn thân có 60% xác suất ưu tiên trở thành mục tiêu của Chiến Pháp quân địch đó, duy trì 2 hiệp	enemy_all	{cavalry,shield,spear,siege}	{}	{}	inherit	\N	{}	\N	complete	{doc-hanh-pha-dich.png}	2026-01-17 16:17:08.132	2026-01-21 07:16:19.342
120	dung-nuoc-day-cau	Dùng Nước Đáy Cầu	active	Chủ Động	S	40	\N	\N	Gây ra cho một nhóm quân địch (2-3 người) trạng thái Bố Chay, mỗi hiệp gây sát thương duy trì (tỉ lệ sát thương 39%→78%, chịu Võ Lực ảnh hưởng), và khiến sát thương mục tiêu gây ra giảm 4%→8% (chịu ảnh hưởng của chiến lệch Võ Lực hai bên), đồng thời khiến bản thân nhận 8%→16% Lâm Phần (khi gây ra sát thương bình dao, khôi phục bình lực nhất định can cử vào lương sát thương của bản thân), duy trì 2 hiệp, sau khi phát động chiến pháp này sẽ có 1 hiệp hồi chiêu	enemy_2_3	{cavalry,shield,archer,siege}	{}	{}	exchange	\N	{}	\N	complete	{dung-nuoc-day-cau.png}	2026-01-17 16:17:08.134	2026-01-21 07:25:14.856
122	kich-ky-nga-quy	Kích Kỷ Nọa Quy	active	Chủ Động	S	40	\N	\N	Trước khi hành động hiệp tiếp theo, nếu sát thương phải chịu vượt quá 20% binh lực tối đa của bản thân, sẽ hồi phục binh lực cho bản thân (tỉ lệ trị liệu 148%→296%, chịu Thống Soái ảnh hưởng), và giảm 12.5%→25% sát thương mưu lược nhận phải (chịu Thống Soái ảnh hưởng), duy trì 1 hiệp, nếu không sẽ gây ra sát thương binh đao cho toàn thể quân địch (tỉ lệ sát thương 77%→154%)	self	{}	{}	{}	exchange	\N	{}	\N	complete	{kich-ky-nga-quy.png}	2026-01-17 16:17:08.136	2026-01-21 07:54:17.733
125	xe-dao-chuoc-dich	Xé Đao Chuốc Địch	active	Chủ Động	S	35	\N	\N	Khiến cả thể quân địch tăng 7.5%→15% sát thương bình dao pháo chịu, và gây (tỷ lệ sát thương 104%→208%) sát thương bình dao và trạng thái Chấn Động cho kẻ địch, duy trì 1 hiệp	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{xe-dao-chuoc-dich.png}	2026-01-17 16:17:08.14	2026-01-17 16:17:08.14
126	kinh-thuat-chinh-yeu	Kinh Thuật Chính Yếu	internal	Nội chính	S	\N	innate	\N	Xe Đao Chước được Chủ động chiến pháp「Kinh Thuật Chính Yếu」	\N	{}	{}	{}	innate	\N	{}	\N	needs_update	{kinh-thuat-chinh-yeu.png}	2026-01-17 16:17:08.141	2026-01-17 16:17:08.141
127	tu-duy-sang-tao	Tu Duy Sáng Tao	command	Chỉ Huy	S	100	innate	\N	Bán thần Mị Lực tăng 15→30	self	{}	{图谋桑桃}	{}	innate	\N	{}	\N	needs_update	{tu-duy-sang-tao.png}	2026-01-17 16:17:08.143	2026-01-17 16:17:08.143
128	tung-hoanh	Tung Hoành	command	Chỉ Huy	A	30	\N	\N	Làm cho bản thân rơi vào trạng thái Liên Kích (mỗi hiệp có thể tấn công thường 2 lần), duy trì 1 hiệp (Xác suất phát động 25% → 45%)	self	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tung-hoanh.png}	2026-01-17 16:17:08.144	2026-01-17 16:17:08.144
129	tinh-hoa	Tĩnh Hỏa	active	Chủ Động	A	30	\N	\N	Tăng 12 → 24 điểm Võ Lực, Trí Lực, tốc độ của Tập thể quân ta (2 người), duy trì 2 hiệp, và xóa hiệu ứng xấu (Xác suất phát động 30%→45%)	ally_2	{cavalry,shield,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tinh-hoa.png}	2026-01-17 16:17:08.145	2026-01-17 16:17:08.145
130	y-the-cam-quyen	Ý Thể Cấm Quyền	active	Chủ Động	A	35	\N	\N	Gây cho cả thể quân địch ngẫu nhiên tấn công Mưu Lược (tỷ lệ sát thương 93%~186%, bị Trí Lực ảnh hưởng), và Hỗn Loạn (tấn công và Chiến Pháp sẽ không phân biệt khi lựa chọn mục tiêu) 1 hiệp	\N	{cavalry,shield,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{y-the-cam-quyen.png}	2026-01-17 16:17:08.146	2026-01-17 16:17:08.146
132	truyen-hich-tuyen-uy	Truyền Hịch Tuyên Uy	command	Chỉ Huy	A	35	\N	\N	Gây cho cả thể quân địch ngẫu nhiên tán công Mưu Lược (tỷ lệ sát thương 82.5%→165%, bị Trí Lực ảnh hưởng), và Giao Binh Khi (không thể tiến hành tán công thường) 2 hiệp	enemy_all	{cavalry,shield,archer,spear}	{}	{}	\N	\N	{}	\N	needs_update	{truyen-hich-tuyen-uy.png}	2026-01-17 16:17:08.149	2026-01-17 16:17:08.149
134	yeu-thuat	Yêu Thuật	command	Chỉ Huy	A	100	innate	\N	Chuẩn bị 1 hiệp, phóng cho toàn thể quân địch trang thái Bão Cát, mỗi hiệp gây ra sát thương liên tục (tỷ lệ sát thương 36% → 72%, bị Trí Lực ảnh hưởng) và khiến bản thân nhận 1 lần Chống Độ, có thể miễn dịch sát thương, duy trì 2 hiệp	enemy_all	{cavalry,shield,spear,siege}	{}	{}	innate	\N	{}	\N	needs_update	{yeu-thuat.png}	2026-01-17 16:17:08.151	2026-01-17 16:17:08.151
137	lieu-su-nhu-than	Liễu Sự Như Thần	active	Chủ Động	A	35	\N	\N	Gây cho tập thể quân địch (2 người) sát thương Mưu Lược (tỷ lệ sát thương 53%→106%, bị Trí Lực ảnh hưởng) và khiến sát thương do chúng gáy ra giảm 8%→16%, duy trì 2 hiệp	enemy_2	{archer,siege}	{}	{}	\N	\N	{}	\N	needs_update	{lieu-su-nhu-than.png}	2026-01-17 16:17:08.155	2026-01-17 16:17:08.155
133	chu-doi-xuat-phat	Chờ Đợi Xuất Phát	command	Chỉ Huy	A	100	\N	\N	Trong chiến đấu, vào hiệp chẵn, sẽ hồi phục Binh Lực cho Tập thể quân ta (2 người) (tỷ lệ Trí Liêu 44%→88%, bị Trí Lực ảnh hưởng)	ally_2	{cavalry,shield,archer}	{}	{}	exchange	\N	{}	\N	complete	{chu-doi-xuat-phat.png}	2026-01-17 16:17:08.15	2026-01-21 03:59:58.728
131	kho-luong-day-ap	Kho Lưỡng Đầy Áp	internal	Nội chính	A	100	innate	\N	Ý Thế Cẩm Quyền - Chủ động 35% - Gây ra sát thương mưu lược và thêm trạng thái hỗn loạn. Khi Võ Tướng được ủy nhiệm làm Quan Lương Thảo, sản lượng lương thực tăng 1%→2%	self	{}	{}	{}	exchange	\N	{}	\N	complete	{kho-luong-day-ap.png}	2026-01-17 16:17:08.147	2026-01-21 07:53:38.165
153	xuat-khau-thanh-chuong	Xuất Khẩu Thành Chuông	command	Chỉ Huy	A	100	innate	\N	Tăng thu hoạch lương thực ở đơn điện	self	{cavalry,shield,archer,spear,siege}	{吴国太}	{}	innate	\N	{}	\N	needs_update	{xuat-khau-thanh-chuong.png}	2026-01-17 16:17:08.174	2026-01-17 16:17:08.174
156	thien-van	Thiên Vấn	internal	Nội chính	B	100	innate	\N	Tăng 8→16 Mi Lực của Vũ Tướng	\N	{}	{甘宁,天问}	{}	innate	\N	{}	\N	needs_update	{thien-van.png}	2026-01-17 16:17:08.178	2026-01-17 16:17:08.178
157	tinh-thong-lam-ruong	Tinh Thông Lam Ruộng	internal	Nội chính	B	100	innate	\N	Khi ủy nhiệm Võ Tướng làm Quân Lương Thảo, thu hoạch lương thực Đồn Điền tăng 1%→2%	\N	{}	{}	{}	innate	\N	{}	\N	needs_update	{tinh-thong-lam-ruong.png}	2026-01-17 16:17:08.179	2026-01-17 16:17:08.179
158	tinh-thong-dao-mo	Tình Thông Đao Mỗ	internal	Nội chính	B	100	innate	\N	Khi ủy nhiệm Võ Tướng làm Quan Sát, thu hoạch sắt Đơn Biên tăng 1% ~ 2%	\N	{}	{}	{关羽}	inherit	\N	{}	\N	needs_update	{tinh-thong-dao-mo.png}	2026-01-17 16:17:08.181	2026-01-17 16:17:08.181
159	tinh-thong-don-ky	Tinh Thông Độn Kỵ	internal	Nội chính	B	100	innate	\N	Khi ủy nhiệm Võ Tướng làm Quan Cổ, thu hoạch gỗ Độn Điền tăng 1%→2%	\N	{cavalry,shield}	{}	{}	innate	\N	{}	\N	needs_update	{tinh-thong-don-ky.png}	2026-01-17 16:17:08.182	2026-01-17 16:17:08.182
160	tinh-thong-nhat-da	Tình Thông Nhật Dã	internal	Nội chính	B	100	innate	\N	Khi ủy nhiệm Vỗ Tướng làm Quan Đá, thu hoạch dã Đồn Điền tăng 1%→2%	\N	{}	{}	{}	innate	\N	{}	\N	needs_update	{tinh-thong-nhat-da.png}	2026-01-17 16:17:08.183	2026-01-17 16:17:08.183
161	uyen-bac	Uyển Bắc	internal	Nội chính	B	100	innate	\N	Khi ủy nhiệm Võ Tướng làm Quan giao dịch, tỷ lệ giao dịch tăng 0.7%→14%	self	{cavalry,shield}	{}	{}	innate	\N	{}	\N	needs_update	{uyen-bac.png}	2026-01-17 16:17:08.185	2026-01-17 16:17:08.185
162	nghi-nhan	Nghi Nhân	internal	Nội chính	B	100	\N	\N	Khi ủy nhiệm Võ Tướng làm Quan Rèn, Bổn tiêu hao giảm 1%→2%	self	{}	{}	{}	\N	\N	{}	\N	needs_update	{nghi-nhan.png}	2026-01-17 16:17:08.186	2026-01-17 16:17:08.186
163	tho-ren	Thợ Ren	internal	Nội chính	B	100	innate	\N	Khi ủy nhiệm Vũ Tướng làm Quân Sát, sản lượng Mô Sắt tăng 0.7%	\N	{cavalry,shield,archer,spear,siege}	{}	{}	innate	\N	{}	\N	needs_update	{tho-ren.png}	2026-01-17 16:17:08.187	2026-01-17 16:17:08.187
166	luyen-gap	Luyện Gấp	internal	Nội chính	B	100	innate	\N	Khi ủy nhiệm Võ Tướng làm Quan Luyện Ngựa, thời gian Luyện Ngựa giảm 1%→2%	\N	{cavalry,shield,archer,spear,siege}	{刀海}	{练兵}	innate	\N	{}	\N	needs_update	{luyen-gap.png}	2026-01-17 16:17:08.191	2026-01-17 16:17:08.191
164	chat-don	Chặt Đốn	internal	Nội chính	B	100	innate	\N	Khi ủy nhiệm Võ Tướng làm Quan Gỗ, sản lượng gỗ tăng 0.7% → 1.4%	self	{}	{}	{}	innate	\N	{}	\N	complete	{chat-don.png}	2026-01-17 16:17:08.188	2026-01-21 04:27:35.841
165	dao-hai	Đao Hải	internal	Nội chính	B	100	innate	\N	Khi ủy nhiệm Võ Tướng làm Quan Đá, sản lượng đá tăng 0.7% → 1.4%	self	{}	{}	{}	inherit	\N	{}	\N	complete	{dao-hai.png}	2026-01-17 16:17:08.19	2026-01-21 07:13:58.999
168	dau-tri	Đấu Trí	active	Chủ Động	B	30	\N	\N	Chuẩn bị 1 hiệp, gây cho Tập thể địch (2 người) Tán Công Mưu Lược (tỷ lệ sát thương 77.5%→155%)	enemy_2	{spear,shield,archer,siege}	{}	{}	inherit	\N	{}	\N	complete	{dau-tri.png}	2026-01-17 16:17:08.194	2026-01-21 07:14:05.385
154	duong-ma-huu-dao	Dưỡng Mã Hữu Đạo	internal	Nội Chính	A	100	innate	\N	Khi ủy nhiệm Võ Tướng làm Quan Luyện Ngựa, Luyện Ngựa tiêu hao giảm 2%→4%	self	{cavalry,shield}	{}	{}	inherit	\N	{}	\N	complete	{duong-ma-huu-dao.png}	2026-01-17 16:17:08.176	2026-01-21 07:27:13.312
167	giam-dap	Giẫm Đạp	active	Chủ Động	B	30	innate	\N	Chuẩn bị 1 hiệp, gây cho Tập thể địch (2 người) Tấn Công Bình Đạo (tỷ lệ sát thương 77.5% → 155%)	enemy_2	{cavalry}	{}	{}	inherit	\N	{}	\N	complete	{giam-dap.png}	2026-01-17 16:17:08.192	2026-01-21 07:28:13.382
155	gian-chinh	Giản Chính	internal	Nội chính	B	100	\N	\N	Giảm tiêu hao luyện ngũ - Tips ngăn Dương Mã Hữu Dao	self	{}	{}	{"Dương Tu"}	inherit	\N	{}	\N	complete	{gian-chinh.png}	2026-01-17 16:17:08.177	2026-01-21 07:29:11.958
152	kieu-kien-than-hanh	Kiều Kiện Thần Hành	active	Chủ Động	A	25	\N	\N	Gây cho cả thế quân địch trạng thái Giao Binh Khí (không thể tiến hành tấn công thường), duy trì 1 hiệp, và bản thân nhận trạng thái Tát Trúng, duy trì 2 hiệp, nếu mục tiêu đã bị Giao Binh Khí (không thể tiến hành tấn công thường) thì sẽ gây ra tấn công Binh Đao (tỷ lệ sát thương 156%, bị tốc độ ảnh hưởng) (Xác suất phát động 25% → 45%)	enemy_all	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	complete	{kieu-kien-than-hanh.png}	2026-01-17 16:17:08.173	2026-01-21 09:17:48.979
173	loan-the-gian-hung	Loạn Thế Gian Hùng	command	Chỉ huy	S	100	\N	\N	Trong quá trình chiến đấu, làm cho tập thể quân Đồng Minh (2 người) tăng 8%→16% sát thương gây ra (bị Trí Lực ảnh hưởng), sát thương bản thân phải chịu giảm 9%→18% (bị Trí Lực ảnh hưởng), nếu bản thân là Chủ Tướng, khi Phó Tướng gây ra sát thương sẽ hồi phục Binh Lực cho Chủ Tướng tương đương 10% lượng sát thương	ally_2	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{loan-the-gian-hung.png}	2026-01-17 16:17:08.2	2026-01-17 16:17:08.2
174	nuoc-ngap-that-quan	Nước Ngập Thất Quân	command	Chỉ Huy	S	50	\N	\N	Thi triển trạng thái Thúy Công với nhóm địch (2 người)(tỉ lệ sát thương 48%→96%, Vô lực ảnh hưởng; Khi bản thân là Tướng Chính, tỉ lệ sát thương tăng đến 54%→108%), duy trì 2 hiệp; Trước khi dùng lần thứ hai trở đi, sẽ khiến sát thương Binh Dao phải chịu của nhóm địch (2-3 người) tăng 10%→20% (Vô lực ảnh hưởng), duy trì 1 hiệp; Khi dùng lần thứ ba trở đi, có 40% (Vô lực	enemy_2	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{nuoc-ngap-that-quan.png}	2026-01-17 16:17:08.202	2026-01-17 16:17:08.202
175	nhan-duc-tai-the	Nhân Đức Tái Thế	command	Chỉ huy	S	100	\N	\N	Mỗi hiệp trí liệu nhóm (2-3 người, tỷ lệ Trí Liệu 34%→68%, ảnh hưởng bởi Trí Lực) quân ta và khiến sát thương phải chịu của mục tiêu giảm 4% (ảnh hưởng bởi Trí Lực), duy trì 1 hiệp, đồng thời có 5%→10% xác suất gây cho 1 quân địch trạng thái Suy Nhược (không thể gây sát thương), duy trì 1 hiệp, khi bản thân là Chủ Tướng, xác suất gây trạng thái Suy Nhược tăng đến 12.5%→25%	enemy_2_3	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{nhan-duc-tai-the.png}	2026-01-17 16:17:08.203	2026-01-17 16:17:08.203
177	uy-chan-hoa-ha	Uy Chấn Hoa Hạ	active	Chủ động	S	35	\N	\N	Chuẩn bị 1 hiệp, tiến hành với quân địch cộng kích mạnh mẽ (tỉ lệ sát thương 73%→146%), khiến mục tiêu có 50% xác suất rơi vào trạng thái Giao binh khi (không thể tiến hành công kích thường), Tàn kẻ (không thể phát động chiến pháp chủ động), Phản đoạn độc lập, duy trì 1 hiệp, và khiến sát thương bình dao của chính mình gây ra tăng cao 18%→36%, duy trì 2 hiệp; khi chính mình là	enemy_all	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{uy-chan-hoa-ha.png}	2026-01-17 16:17:08.205	2026-01-17 16:17:08.205
178	phung-lenh-binh-lo	Phụng Lệnh Bình Lỗ	command	Chỉ huy	S	100	\N	\N	Trong chiến đấu, khi quân ta nhận buff tính năng có 17.5%→35% xác suất (Thông Soái ảnh hưởng, khi bản thân là Chủ Tướng, giá trị có bản tăng đến 20%→40%) kéo dài thêm 1 hiệp; Hiệu quả này mỗi khi kích hoạt 3 lần sẽ trị liệu 1 quân ta (tỷ lệ Trị Liệu 20%→40%, ảnh hưởng bởi Binh Lục đã tồn thất) và nếu Trí Lực của quân ta cao hơn Võ Lực sẽ nhận 5%→10% Công Tâm, nếu	\N	{cavalry,shield,archer,spear}	{}	{}	\N	\N	{}	\N	needs_update	{phung-lenh-binh-lo.png}	2026-01-17 16:17:08.207	2026-01-17 16:17:08.207
176	giao-huyet-tung-hoanh	Giáo Huyết Tung Hoành	passive	Bị động	S	100	\N	\N	Trong quá trình chiến đấu, làm cho bản thân nhận 17→34 điểm Vô Lực và 27%→54% hiệu ứng tấn công nhóm (khi tấn công thường gây ra sát thương cho các Võ Tướng khác cùng đội quân với mục tiêu), khi bản thân là Chủ Tướng, điểm tấn công nhóm là 30%→60%	enemy_all	{cavalry,shield,archer,spear,siege}	{"Mã Siêu"}	{}	innate	\N	{}	\N	complete	{giao-huyet-tung-hoanh.png}	2026-01-17 16:17:08.204	2026-01-21 07:31:08.374
196	ho-dai	Hổ Dại	passive	Bị động	S	100	\N	\N	Trong trận, mỗi hiệp sẽ chọn một quân địch, tất cả tấn công do bản thân phát động đều sẽ khóa chọn mục tiêu này và sát thương gây ra tăng 16.5%→33% (bị Vô Lực ảnh hưởng); Nếu đánh bại được mục tiêu sẽ giúp bản thân nhận được trạng thái Phá Trận (khi gây sát thương sẽ bỏ qua Thống Soái và Trí Lực của mục tiêu), duy trì đến hết trận	enemy_1	{cavalry,shield,archer,spear,siege}	{"Hứa Chử"}	{}	innate	\N	{}	\N	complete	{ho-dai.png}	2026-01-17 16:17:08.229	2026-01-21 07:40:06.575
179	nghich-giang-dieu-lo	Nghịch Giang Diệu Lõ	passive	Bị động	S	100	\N	\N	Trong khi chiến đấu, mỗi hiệp có 25%→50% xác suất Tịnh Hóa bản thân, khi bản thân này ra sát thương sẽ có 17.5%→35% xác suất khiến 1 quân địch ngẫu nhiên rơi vào trạng thái Kế Tận hoặc Chấn Động, duy trì 1 hiệp, mỗi hiệp tối đa kích hoạt 1 lần, khi nhận phải sát thương, có 30%→60% xác suất gây ra sát thương loại tương ứng cho 1 quân địch (tỷ lệ sát thương 25%→50%, bị	enemy_1	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{nghich-giang-dieu-lo.png}	2026-01-17 16:17:08.208	2026-01-17 16:17:08.208
181	uy-tin-dung-vo	Uy Tín Dũng Võ	passive	Bị động	S	100	\N	\N	Trong chiến đấu, bản thân mỗi hiệp nhận 16.5%→33% Nhin Thấu (Tốc Độ ảnh hưởng, duy trì 1 hiệp; Nhin Thấu: Khi gây sát thương sẽ bỏ qua hiệu quả giảm sát thương phải chịu của mục tiêu với tỷ lệ nhất định); Tướng Chính quân địch trước khi hành động mỗi hiệp, bản thân có 16.5%→33% xác suất (ảnh hưởng bởi chênh lệch Tốc Độ của 2 bên) phát động 1 lần tấn công thường lên Võ	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{uy-tin-dung-vo.png}	2026-01-17 16:17:08.21	2026-01-17 16:17:08.21
184	tuu-tri-nhuc-lam	Tứu Trì Nhục Lâm	passive	Bị động	S	100	\N	\N	Trong chiến đấu, mỗi hiệp khiến Võ Tướng nam phe ta nhận 2%→4% Lâm Phán (khi tạo thành sát thương Bình Đao, khôi phục cho bạn thân lượng Bình Lực nhất định dựa trên lượng sát thương) và 10 điểm Võ Lực, có thể cộng dồn, duy trì đến khi kết thúc chiến đấu; Kể từ hiệp chiến đấu thứ 5, mỗi hiệp tạo ra sát thương Bình Đao đến toàn thể quân địch (tỷ lệ sát thương 30%→60%, khi	ally_1_2	{cavalry,shield,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tuu-tri-nhuc-lam.png}	2026-01-17 16:17:08.214	2026-01-17 16:17:08.214
185	thien-ha-vo-song	Thiên Hạ Vô Song	command	Chỉ Huy	S	35	\N	\N	Phát động chiến đấu tối đa thể quân địch, hai bên quyết đấu lần lượt tấn công thường đối phương 3 lần, bản thân ra tay trước. Trong quá trình quyết đấu, hai bên không chịu ảnh hưởng trạng thái Chấn Động và Giao Binh Khi, đồng thời có thể kích hoạt trạng thái Quân Công và Chiến Pháp Đột Kích; Khi bản thân là Tướng Chính, trước quyết đấu khiến sát thương bản thân chịu phải giảm 3.5%	enemy_1	{cavalry,shield,spear}	{}	{}	\N	\N	{}	\N	needs_update	{thien-ha-vo-song.png}	2026-01-17 16:17:08.216	2026-01-17 16:17:08.216
186	xa-than-cuu-chu	Xã Thần Cứu Chú	passive	Bị động	S	100	\N	\N	Trong chiến đấu, sát thương bản thân phải chịu giảm 45%→90%, sau mỗi lần chịu sát thương, hiệu quả này giảm 1.5%→3%; Sau khi hiệu quả này giảm 5 lần, khi bản thân chịu sát thương có 17.5%→35% xác suất (ảnh hưởng bởi Thông Soái) coi là 2 lần (có thể kích hoạt thêm hiệu quả Phản Kích, Cấp Cứu)	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{xa-than-cuu-chu.png}	2026-01-17 16:17:08.217	2026-01-17 16:17:08.217
180	hoa-thieu-lien-doanh	Hỏa Thiêu Liên Doanh	active	Chủ Động	S	50	\N	\N	Phóng cho một quân địch trang thái Đốt cháy (tỉ lệ sát thương 41%→82%, chịu ảnh hưởng của trí lực, khi chính mình là chủ tướng, tỉ lệ sát thương tăng cao 49%→98%), duy trì 3 hiệp, ngẫu nhiên phóng ra 2 lần. Nếu mục tiêu đã có trang thái Đốt cháy thì sẽ tiến hành Đốt doanh trại: gây ra cho toàn thể quân địch cộng kích mưu lược (tỉ lệ sát thương 31%→62%, chịu ảnh hưởng của trí	enemy_all	{cavalry,shield,archer,spear,siege}	{"Lục Tốn"}	{}	innate	\N	{}	\N	complete	{hoa-thieu-lien-doanh.png}	2026-01-17 16:17:08.209	2026-01-21 07:41:03.525
183	hung-van-bo-vu	Hưng Văn Bố Vũ	command	Chỉ Huy	S	100	\N	\N	Trong chiến đấu, khi bất đầu hiệp đấu quân địch mỗi khi có 1 loại trang thái sát thương mang tính duy trì, bản thân sẽ tiến hành 1 lần Trí Liệu đến một cá thể quân ta (tỷ lệ Trí Liệu 20%→40%, chịu ảnh hưởng của Trí Lực); Khi hiệp chiến đấu thứ 2 bất đầu, khiến toàn thể quân địch vào trạng thái thụy công (tỷ lệ sát thương 36%→72%, chịu ảnh hưởng của Trí Lực), và khiến sát thương	ally_2_3	{cavalry,shield,archer,spear,siege}	{"Vu Cát"}	{}	innate	\N	{}	\N	complete	{hung-van-bo-vu.png}	2026-01-17 16:17:08.213	2026-01-21 07:44:02.131
188	vu-sau-kho-do	Vũ Sầu Khó Do	command	Chỉ huy	S	100	\N	\N	Trong chiến đấu, khi nhóm quân ta (2-3 người) chịu tấn công thường, có 25%→50% xác suất (Thống Soái ảnh hưởng, khi bản thân là Tướng Chính, xác suất co bản tăng đến 30%→60%) khiến người gây sát thương tăng 3%→6% sát thương phải chịu (Thống Soái ảnh hưởng), có thể cộng dồn 3 lần; Khi kích hoạt trong hiệp đấu, nếu Võ Tướng người sát thương có Võ Lực cao hơn Trí Lực, sẽ	ally_2_3	{cavalry}	{}	{}	\N	\N	{}	\N	needs_update	{vu-sau-kho-do.png}	2026-01-17 16:17:08.219	2026-01-17 16:17:08.219
190	tu-chien-khong-lui	Tử Chiến Không Lui	passive	Bị động	S	100	\N	\N	Trong chiến đấu, giúp bản thân miễn dịch Hỗn Loạn; Khi bản thân chịu sát thương, có 80% nhận được 1 tầng hiệu quả Tích Uy, có thể cộng dồn 20 tầng; Sau khi tấn công thường, có xác suất 50% (bị Vô lực ảnh hưởng) dùng 1 tầng Tích Uy để gây cho 1 Vỏ Tướng một lần sát thương Binh Dao (tỉ lệ sát thương 65%→130%), sau khi kích hoạt thì sẽ phán đoán lại, xác suất sau mỗi lần kích	self	{shield}	{}	{}	\N	\N	{}	\N	needs_update	{tu-chien-khong-lui.png}	2026-01-17 16:17:08.222	2026-01-17 16:17:08.222
192	thien-ha-danh-xao	Thiên Hà Danh Xảo	internal	Nội chính	S	100	\N	\N	Khi Võ Tướng được ủy nhiệm làm Sở Thần, xác suất thưởng bậc cao tăng 4.5%	self	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{thien-ha-danh-xao.png}	2026-01-17 16:17:08.224	2026-01-17 16:17:08.224
193	lay-nhu-che-cuong	Lẩy Nhu Chế Cương	command	Chỉ huy	S	100	\N	\N	Trong chiến đấu, sát thương công thường toàn thể địch ta giảm 17.5%→35%, khi bản thân chịu sát thương có 25%→50% xác suất (Trí Lực ảnh hưởng) tránh từ người gây sát thương 5→10 điểm thuốc tính (ngẫu nhiên 1 loại trong Trí Lực, Thống Soái, Tốc Độ, chịu Trí Lực ảnh hưởng, có thể cộng dồn, duy trì 5 hiệp); Toàn thể quân ta sau khi công thường, bản thân có 25%→50% xác suất	ally_all	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{lay-nhu-che-cuong.png}	2026-01-17 16:17:08.225	2026-01-17 16:17:08.225
194	thanh-luu-nha-vong	Thanh Lưu Nhã Vọng	internal	Nội chính	S	100	\N	\N	Khi ủy nhiệm Vò Tướng làm Quan Sát, sát thương Mô Sát tăng 1.5%→3%	\N	{}	{}	{}	\N	\N	{}	\N	needs_update	{thanh-luu-nha-vong.png}	2026-01-17 16:17:08.226	2026-01-17 16:17:08.226
195	that-bai-thanh-thi	Thất Bại Thánh Thị	internal	Nội chính	S	100	\N	\N	Khi ủy nhiệm Võ Tướng làm Quan Rèn, tăng 4.5%→9% xác suất Rèn ra trang bị bậc cao	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{that-bai-thanh-thi.png}	2026-01-17 16:17:08.228	2026-01-17 16:17:08.228
187	ho-hau	Hổ Hầu	command	Chỉ Huy	S	100	\N	\N	Trong chiến đấu, khi nhóm quân ta phát động hoặc chịu tấn công thường, bản thân có 22.5%→45% xác suất khiến Thông Soái toàn thể quân ta tăng 7.5→15 điểm, có thể cộng dồn 5 lần, duy trì 2 hiệp, và gây sát thương Binh Đao cho don thể quân địch (tỷ lệ sát thương 33%→66%)	enemy_1	{cavalry,shield,archer,spear,siege}	{"SP Hứa Chử"}	{}	innate	\N	{}	\N	complete	{ho-hau.png}	2026-01-17 16:17:08.218	2026-01-21 07:40:36.023
189	ke-dinh-muu-quyet	Kế Định Mưu Quyết	passive	Bị động	S	100	\N	\N	Lấy trộm Võ Tướng có Trí Lực cao nhất phê địch 12→24 điểm Trí Lực (chịu ảnh hưởng Trí Lực); Đồng thời trước mỗi lần bản thân thứ phát động Chiến Pháp chủ động, khôi phục cả thể quân ta binh lực nhất định (tỉ lệ trị liệu 32%→64%, chịu Trí Lực ảnh hưởng)	\N	{cavalry,shield,archer,spear,siege}	{}	{}	innate	\N	{}	\N	complete	{ke-dinh-muu-quyet.png}	2026-01-17 16:17:08.221	2026-01-21 07:49:12.807
200	thap-nhi-ky-sach	Tháp Nhi Ký Sách	active	Chủ động	S	45	\N	\N	Xóa trạng thái tăng ích của tập thể quân địch (1-2 người), toàn thể quân ta có 1 hiệp với xác suất phát động Chiến Pháp chủ động tăng 3%→6% (bị Trí Lực ảnh hưởng) và làm cho lần sau mục tiêu phát động Chiến Pháp chủ động sẽ gây ra tấn công Mưu Lược cho cả thể quân địch, (tỷ lệ sát thương 51%→102%, bị Trí Lực ảnh hưởng)	enemy_1_2	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{thap-nhi-ky-sach.png}	2026-01-17 16:17:08.234	2026-01-17 16:17:08.234
201	tien-quan-than-toc	Tiến Quân Thần Tốc	command	Chỉ huy	S	100	\N	\N	Trong chiến đấu, toàn thể quân ta sau mỗi lần gây ra sát thương Bình Dao, sẽ khiến họ tăng 3.5%→7% sát thương Bình Dao gây ra, có thể cộng dồn 5 lần. Sau khi cộng dồn 5 lần, sẽ khiến họ giảm 5%→10% sát thương phải chịu (Vô Lực ảnh hưởng), duy trì 2 hiệp.	ally_all	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tien-quan-than-toc.png}	2026-01-17 16:17:08.235	2026-01-17 16:17:08.235
203	tinh-luyen-sach-so	Tinh Luyện Sách Số	active	Chủ động	S	45	\N	\N	Chuẩn bị 1 hiệp, gây cho quân thế quân địch (2-3 người) công kích mưu lược (tỷ lệ sát thương 105%→210%, bị Trí lực ảnh hưởng), và giao binh khí (không thể tiến hành Công thường), duy trì 2 hiệp	enemy_2_3	{cavalry,shield,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tinh-luyen-sach-so.png}	2026-01-17 16:17:08.238	2026-01-17 16:17:08.238
204	tui-gam-dieu-ke	Túi Gấm Điệu Kế	command	Chỉ huy	S	100	\N	\N	Trong chiến đấu, hiệp số lẻ có 16%→32% xác suất (chịu ảnh hưởng Trí Lực), hiệp số chẵn có 37.5%→75% xác suất (chịu ảnh hưởng Trí Lực) khiến tỷ lệ phát động Chiến Pháp Chủ Động từ mạng của 1 đồng đội tăng 100% và có 17.5%→35% xác suất bỏ qua 1 hiệp chuẩn bị, duy trì 1 hiệp; Nếu bản thân là Tướng Chính, khi kích hoạt sẽ Trị Liệu 1 đồng đội có Binh Lực thấp nhất phe ta	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tui-gam-dieu-ke.png}	2026-01-17 16:17:08.239	2026-01-17 16:17:08.239
205	the-thu-vo-hang	Thể Thù Vô Hàng	active	Chủ động	S	35	\N	\N	Chuẩn bị 1 hiệp, khiến Tập thể quân ta (2 người) rơi vào trạng thái Quan Sát (miễn dịch tất cả hiệu ứng Không Chế), duy trì 2 hiệp, và khiến bản thân trong vòng 2 hiệp khi nhận 1 lần sát thương Mưu Lược, sẽ Kế Tấn (không thể phát động Chiến Pháp chủ động) tướng chính quân địch, duy trì 2 hiệp (Xác suất phát động 25%→35%)	ally_all	{cavalry,shield,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{the-thu-vo-hang.png}	2026-01-17 16:17:08.24	2026-01-17 16:17:08.24
206	thuong-ua-nhu-phong	Thương Ưa Như Phong	command	Chủ động	S	35	\N	\N	Khiến nhóm quân ta (2-3 người) nhận 2 lần Chống Đỡ, duy trì 2 hiệp, và khiến bản thân sau khi phát động tấn công thường trong hiệp này, sẽ gây sát thương Bình Đạo cho mục tiêu (tỉ lệ sát thương 120%→240%) và trang thái Cuốp Trận: Khi trang thái Cuốp Trận cộng dồn đến 2 lần, sẽ xóa trang thái này và và tăng cho bản thân 20→40 điểm Võ Lực, có thể cộng dồn	ally_2_3	{cavalry,shield,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{thuong-ua-nhu-phong.png}	2026-01-17 16:17:08.241	2026-01-17 16:17:08.241
207	xuat-dao-nhu-sam	Xuất Đao Như Sấm	active	Chủ động	S	40	\N	\N	Chuẩn bị 1 hiệp, bản thân và một đồng đội đơn thể nhận 15%→30% Làm Phản, duy trì 2 hiệp, đồng thời gây sát thương Binh Đao cho cả thể quân địch (tỷ lệ sát thương 90%→180%) và trạng thái Lược Trận, lặp lại 3 lần: khi trạng thái Lược Trận cộng đồn 2 lần, xóa trạng thái Lược Trận và khiến mục tiêu chịu sát thương Binh Đao tăng 15%→30%, có thể cộng đồn; nếu ra trận cùng	enemy_all	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{xuat-dao-nhu-sam.png}	2026-01-17 16:17:08.242	2026-01-17 16:17:08.242
208	mat-ke-giet-nghich	Mặt Kẻ Giết Nghịch	command	Chỉ huy	S	100	\N	\N	Khi chiến đấu, sau khi Tướng Chính bên ta gây sát thương (Trên 300), có 25%→50% xác suất giảm 7.5%→15% sát thương cuối của một đơn vị quân địch gây ra (bị ảnh hưởng bởi Thông Soái, duy trì 2 hiệp, có thể cộng dồn 3 lần), và 2 hiệp đầu tiên có 25%→50% xác suất (bị ảnh hưởng bởi Thông Soái) để Tướng Chính gây 1 lần sát thương Binh Dao lên toàn quân địch (tỷ lệ sát thương 12.5%)	enemy_all	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{mat-ke-giet-nghich.png}	2026-01-17 16:17:08.244	2026-01-17 16:17:08.244
210	nghia-dan-hung-tam	Nghĩa Đản Hung Tâm	passive	Bị động	S	100	\N	\N	Trong quá trình chiến đấu, hiệp sỗ lé sẽ gây cho một quân địch 92%→184% sát thương Binh Đao và giảm 32→64 điểm Võ Lực, duy trì 2 hiệp, hiệp sỗ chân sẽ gây cho một nhóm quân địch (2 người) 38%→76% sát thương Mưu Lược (bị Trí Lực ảnh hưởng) và giảm 17→34 điểm Trí Lực, duy trì 2 hiệp; khi bản thân là Chủ tướng, giảm hiệu ứng thuốc tính sẽ bị thuốc tính tương ứng của bản thân	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{nghia-dan-hung-tam.png}	2026-01-17 16:17:08.246	2026-01-17 16:17:08.246
211	ky-binh-gian-dao	Kỳ Bình Gian Đạo	passive	Bị động	S	100	\N	\N	Trong chiến đấu, khi bản thân phát động Chiến Pháp Chuẩn Bị, có 75% xác suất (chịu ảnh hưởng Vũ Lực) giảm thời gian chuẩn bị 1 hiệp, 4 hiệp chiến đầu đầu, sát thương tạo thành của Chiến Pháp Chủ Động tăng 15%→30% (chịu ảnh hưởng Vũ Lực), vào hiệp thứ 5, nếu Binh Lực bản thân thấp hơn 50%, sẽ nhận 22.5%→45% Lãm Phán, nếu không tỷ lệ phát động Chiến Pháp Chủ	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{ky-binh-gian-dao-1.png,ky-binh-gian-dao-2.png}	2026-01-17 16:17:08.247	2026-01-17 16:17:08.247
214	yen-nhan-gao-thet	Yến Nhân Gao Thết	passive	Bị động	S	100	\N	\N	Chiến đấu hiệp thứ 2, 4, phát động tấn công binh đao lên toàn thể quân địch (Tỷ lệ sát thương 52%→104%); Nếu mục tiêu trong trạng thái Giao Binh Khí hoặc Kế Tân, thì Thống Soái của mục tiêu giảm 25%→50%, duy trì 2 hiệp, khi bản thân là Tuởng Chính, hiệp thứ 6 phát động tấn công binh đao lên toàn thể quân địch (Tỷ lệ sát thương 44%→88%)	enemy_all	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{yen-nhan-gao-thet.png}	2026-01-17 16:17:08.251	2026-01-17 16:17:08.251
209	con-gai-tuong-mon	Con Gái Tướng Môn	active	Chủ động	S	60	\N	\N	Gây cho một nhóm quân địch (2 người) sát thương binh dao (tỷ lệ sát thương 64%→128%) và hiệu ứng Hổ Cầu: 1 hiệp tiếp theo nhận thêm sát thương binh dao (tỷ lệ sát thương 10%→20%, mỗi lần mục tiêu nhận phải sát thương, tỷ lệ sát thương tăng 15%→30%, tối đa cộng dồn 3 lần), nếu trong thời gian hiệu ứng Hổ Cầu mục tiêu nhận thêm 3 lần sát thương, lập tức tổng kết hiệu quả Hổ Cầu	enemy_2	{cavalry,shield,archer,spear,siege}	{"Quan Ngân Bình"}	{}	innate	\N	{}	\N	complete	{con-gai-tuong-mon.png}	2026-01-17 16:17:08.245	2026-01-21 04:29:19.53
212	bach-phat-bach-trung	Bách Phát Bách Trúng	active	Chủ Động	S	35	\N	\N	Chuẩn bị 1 hiệp, tăng cao cho chính mình 12.5%→25% tỉ lệ hội tâm (khi kích hoạt, sát thương bình dao tăng cao 100%), duy trì 2 hiệp, sau đó gây ra công kích bình dao cho toàn thể quân địch (tỉ lệ sát thương 90%→180%), nếu mục tiêu ở trạng thái không chế, thì sức mạnh của công kích binh đao này càng mạnh (tỉ lệ sát thương 120%→240%)	enemy_all	{cavalry,shield,archer,spear,siege}	{"Hoàng Trung"}	{}	innate	\N	{}	\N	complete	{bach-phat-bach-trung.png}	2026-01-17 16:17:08.249	2026-01-21 03:50:06.334
213	gan-goc-phi-thuong	Gan Góc Phi Thưởng	passive	Bị động	S	100	\N	\N	Trong chiến đấu, bản thân nhận trạng thái Quan Sát (miễn dịch tất cả hiệu quả không chế), Võ Lực, Trí Lực, Tốc Độ, Thống Soái tăng 20→40 điểm, và bản thân sau mỗi lần miễn dịch trạng thái không chế, có 20%→40% xác suất (chịu ảnh hưởng tỷ lệ Hội Tâm, khi bản thân là Tướng Chính, xác suất có bản tăng đến 35%→70%) nhận 3.5%→7% Hội Tâm, duy trì đến khi kết thúc chiến đấu,	self	{cavalry,shield,archer,spear,siege}	{"Triệu Vân"}	{}	innate	\N	{}	\N	complete	{gan-goc-phi-thuong.png}	2026-01-17 16:17:08.25	2026-01-21 07:27:38.948
215	giang-thien-truong-diem	Giang Thiên Trưởng Diệm	command	Chỉ huy	S	100	\N	\N	Trong chiến đấu, mỗi hiệp sẽ thi triển 1 tầng Trưởng Điểm lên toàn thể quân dịch (nếu mục tiêu trong trạng thái Đốt Cháy hoặc Thúy Công sẽ có 50% xác suất thi triển thêm 1 tầng), mỗi tầng Trưởng Điểm sẽ khiến sát thương Mưu Lược phải chịu tăng 2%→4%; Khi bản thân hành động sẽ gây sát thương Mưu Lược cho 1 quân dịch ngẫu nhiên (tỷ lệ sát thương 50%→100%, Trí Lực ảnh hưởng)	enemy_all	{cavalry,shield,archer,spear,siege}	{"SP Chu Du"}	{}	innate	\N	{}	\N	complete	{giang-thien-truong-diem.png}	2026-01-17 16:17:08.252	2026-01-21 07:30:53.894
217	toa-doan-dong-nam	Tọa Đoạn Đông Nam	command	Chỉ huy	S	100	\N	\N	Trong chiến đấu, sau khi bản thân và 1 quân Đồng Minh phát động tấn công thường thành công, bản thân có 37.5%→75% xác suất nhận ngẫu nhiên 1 trạng thái: Liên Kích, Quan Sát, Tán Công Trước, Át Trừng, Phá Trận, ưu tiên nhận trạng thái khác nhau, duy trì 2 hiệp; khi bản thân là Chủ Tướng, hiệp đầu trước khi hành động bản thân có 37.5%→75% xác suất nhận 1 trạng thái: Liên	ally_1	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{toa-doan-dong-nam.png}	2026-01-17 16:17:08.255	2026-01-17 16:17:08.255
219	than-hinh-sat-lu	Thần Hình Sát Lù	passive	Bị động	S	100	\N	\N	Trong quá trình chiến đấu, gánh chịu sát thương cho quân Đông Minh (15%→30%, Chủ tướng quân Đông Minh là 30%→60%)(sát thương Binh Đạo gánh chịu còn bị Thông Soái của bản thân ảnh hưởng mà giảm đi), khi Binh Lực của quân Đông Minh cao hơn 70%, sẽ làm cho sát thương gây ra tăng 12%→18% (bị Thông Soái ảnh hưởng), nếu Chủ tướng là Tôn Quyền, giá trị cơ bản của tăng	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{than-hinh-sat-lu.png}	2026-01-17 16:17:08.257	2026-01-17 16:17:08.257
221	than-xa	Thần Xạ	passive	Bị động	S	100	\N	\N	Trong khi chiến đấu, khiến bản thân nhận trạng thái Liên kích, mỗi hiệp được tấn công thường 2 lần, và khiến mục tiêu tấn công thường giảm 5→25 Thông Soái, được cộng dồn, duy trì 2 hiệp	\N	{archer}	{}	{}	\N	\N	{}	\N	needs_update	{than-xa.png}	2026-01-17 16:17:08.259	2026-01-17 16:17:08.259
57	bach-nhi-binh	Bạch Nhị Binh	troop	Binh Chủng	S	100	\N	\N	Tiến bác Linh Thương thành Bách Nhi Binh đã đánh lá thắng: Toàn thể quân ta nhận 12% Công Tâm, và sau khi tấn công thường có 20% →45% xác suất lại tạo ra 1 lần tấn công Mưu Lược vào mục tiêu tấn công (tỷ lệ sát thương 55% →110%, chịu ảnh hưởng Trí Lực); Nếu Trận Đáo làm thống lĩnh thì tấn công Mưu Lược sẽ càng mạnh hơn (tỷ lệ sát thương 65% →130%, chịu ảnh hưởng Trí Lực)	ally_all	{spear}	{"Trần Đáo"}	{"Trần Đáo"}	inherit	\N	{}	\N	complete	{bach-nhi-binh.png}	2026-01-17 16:17:08.051	2026-01-21 03:57:36.877
218	cam-pham-bach-linh	Cẩm Phàm Bách Linh	passive	Bị động	S	100	\N	\N	Trong chiến đấu, tăng 25%→50% xác suất Hỗi Tâm của bản thân (khi kích hoạt sát thương Binh Dao tăng 100%) và 10%→20% sát thương Hỗi Tâm; Khi bản thân là Tướng Chính, tăng nhóm quân ta (2 người) 2.5%→5% xác suất Hỗi Tâm, 5%→10% sát thương Hỗi Tâm và 5%→10% Lâm Phân	self	{cavalry,shield,spear,siege}	{"Cam Ninh"}	{}	innate	\N	{}	\N	complete	{cam-pham-bach-linh.png}	2026-01-17 16:17:08.256	2026-01-21 04:26:45.504
222	giang-dong-manh-ho	Giang Đông Mãnh Hổ	command	Chủ động	S	50	\N	\N	Gây cho nhóm địch (2 người) 63%→126% sát thương Binh Dao và Chế Giáu (áp mục tiêu tấn công thường bản thân), duy trì 2 hiệp; khi bản thân là Chủ Tướng, sát thương tấn công thường bản thân phải chịu giảm 10%→20% (chịu ảnh hưởng của Võ Lực), duy trì 2 hiệp	enemy_2	{cavalry,shield,archer,spear}	{}	{}	innate	\N	{}	\N	complete	{giang-dong-manh-ho.png}	2026-01-17 16:17:08.261	2026-01-21 07:29:47.349
223	hieu-thang-duy-ac	Hiệu Thắng Duy Ác	command	Chỉ Huy	S	100	\N	\N	Trong chiến đấu, Tướng Chính phe ta tăng 7%→14% Công Tâm, 7%→14% tỷ lệ Kỹ Mưu (bị Trí Lực ảnh hưởng, khi kích hoạt Kỹ Mưu, sát thương Mưu Lược tăng 100%) và 20% sát thương Kỹ Mưu, đồng thời gánh chịu 15%→30% sát thương cho Tướng Chính (bản thân là Tướng Chính sẽ vô hiệu)	ally_1	{cavalry,shield,archer,spear,siege}	{"Lục Kháng"}	{}	innate	\N	{}	\N	complete	{hieu-thang-duy-ac.png}	2026-01-17 16:17:08.262	2026-01-21 07:37:40.752
249	kho-nhuc-ke	Khỏ Nhục Kế	active	Chủ Động	S	40	\N	\N	Gây sát thương Binh Đao cho bản thân (tỷ lệ sát thương 40%), khiến cả thế quân địch rơi vào trạng thái Đốt Cháy (tỷ lệ sát thương 61%→122%, bị Trí Lực ảnh hưởng) và Hỗn Loạn (tấn công và Chiến Pháp sẽ không phân biệt khi lựa chọn mục tiêu) và khiến sát thương Binh Đao bản thân phải chịu giảm 15%→30%, duy trì 2 hiệp	enemy_1	{cavalry,shield,spear,siege}	{"Hoàng Cái"}	{}	innate	\N	{}	\N	complete	{kho-nhuc-ke.png}	2026-01-17 16:17:08.294	2026-01-21 07:53:51.236
224	than-hoa-ke	Thần Hóa Kế	passive	Bị động	S	100	\N	\N	Trong chiến đấu, khi mỗi lần bản thân phát động Chiến Pháp Chủ Động thành công, có 40%→80% xác suất phát động tấn công Mưu Lược đến toàn thể quân địch (tỷ lệ sát thương 34%→68%, chịu ảnh hưởng Trí Lực), và tạo thêm sát thương Mưu Lược cho mục tiêu đang trong trạng thái Đốt Cháy (tỷ lệ sát thương 34%, chịu ảnh hưởng Trí Lực, và tăng cao dựa vào độ chênh lệch Trí Lực)	\N	{archer,shield,siege,spear}	{}	{}	\N	\N	{}	\N	needs_update	{than-hoa-ke.png}	2026-01-17 16:17:08.263	2026-01-17 16:17:08.263
225	li-nguyet	Lì Nguyệt	command	Chỉ huy	S	100	\N	\N	Trong chiến đấu, khi bản thân nhận Trị Liệu, có 20%→40% xác suất (Trí Lực ảnh hưởng) Trị Liệu một đơn vị đồng đội (tỷ lệ Trị Liệu 34%→68%, Trí Lực ảnh hưởng), mỗi hiệp tối đa kích hoạt 5 lần; Khi đồng đội nhận Trị Liệu, có 20%→40% xác suất (Trí Lực và Mị Lực ảnh hưởng) khiến mục tiêu giảm 1.5%→3% sát thương phải chịu (Trí Lực ảnh hưởng), có thể cộng dồn 5 lần, duy trì 2 hiệp;	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{li-nguyet.png}	2026-01-17 16:17:08.264	2026-01-17 16:17:08.264
226	quyen-tiem-cuu-dinh	Quyền Tiếm Cửu Đình	command	Chỉ huy	S	100	\N	\N	Trong chiến đấu, khi quân địch nhận Trí Liêu, có 25%→50% xác suất (Thông Soái ảnh hưởng) chuyển 6%→12% lượng Trí Liêu (Thông Soái ảnh hưởng) sang bản thân; Khi bản thân nhận Trí Liêu, có 25%→50% xác suất (Thông Soái ảnh hưởng) tăng thêm 2.5→5 điểm Thông Soái và Trí Lực (Thông Soái ảnh hưởng), có thể cộng dồn tối đa 99 lần.	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{quyen-tiem-cuu-dinh.png}	2026-01-17 16:17:08.266	2026-01-17 16:17:08.266
227	pho-nguy-dep-loan	Phô Nguy Đẹp Loạn	command	Chỉ huy	S	100	\N	\N	Trong hiệp đấu, khiến toàn thể quân ta giảm 19.5%→39% sát thương phải chịu (Chịu ảnh hưởng bởi thuộc tính cao nhất của bản thân, khi bản thân là Tướng Chính, chỉ số có bản tăng 21%→42%); Mỗi hiệp bản thân có 20%→40% xác suất (Chịu ảnh hưởng Thông Soái) xóa trạng thái tiêu cực cho Tướng Chính phe ta và khiến mục tiêu tăng 1.5%→3% Vũ Lực, Trí Lực, Thông Soái	ally_all	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{pho-nguy-dep-loan.png}	2026-01-17 16:17:08.267	2026-01-17 16:17:08.267
228	vi-su-tat-khuyet	Vi Sư Tát Khuyết	command	Chỉ huy	S	100	\N	\N	Trong chiến đấu, khi nhóm quân địch (2 người) trong trạng thái Bó Chạy hoặc Đạo Phản sẽ tiến hành áp chế quân địch, khiến sát thương Mưu Lược phê địch gây ra giảm 19.5%→39% (Thông Soái ảnh hưởng, sau khi kích hoạt mỗi hiệp giảm đáp 1/3), chiến đấu hiệp thứ 2 sẽ khiến toàn thể quân địch rơi vào trạng thái Đạo Phản (tỉ lệ sát thương 60%→120%, chịu ảnh hưởng bởi thuộc tính)	enemy_2_3	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{vi-su-tat-khuyet.png}	2026-01-17 16:17:08.268	2026-01-17 16:17:08.268
229	ngao-nghe-vuong-hau	Ngạo Nghễ Vượng Hầu	command	Chỉ huy	S	100	\N	\N	Khi chiến đấu, phát hiện 15 sơ hở của quân địch, sơ hở sẽ phân bổ cho toàn quân địch, khi quân địch mục tiêu bị tấn công thường thì sẽ kích hoạt 1 sơ hở, khiến mục tiêu này giảm 1.5%→3% Võ Lực, Trí Lực, Thống Soái, Tốc Độ (bị Trí Lực ảnh hưởng), có thể cộng dồn; Khi tất cả sơ hở của một mục tiêu đều bị kích hoạt, sẽ khiến hắn rơi vào trạng thái Suy Nhược trong 1 hiệp, và sát	enemy_all	{cavalry,shield,archer,spear}	{}	{}	\N	\N	{}	\N	needs_update	{ngao-nghe-vuong-hau.png}	2026-01-17 16:17:08.269	2026-01-17 16:17:08.269
239	tran-ap-phong-cu	Trấn Áp Phòng Cự	command	Chỉ huy	S	100	\N	\N	Mỗi hiệp có 50% tỉ lệ (chịu ảnh hưởng trí lực) khiến một quan ta (ưu tiên chọn phổ tướng ngoại chính mình) cứu viện tất cả phe ta và nhận trang thái Nghị Ngời (mỗi hiệp hồi phục binh lực một lần, tỉ lệ trị liệu 96%→192%, chịu ảnh hưởng trí lực) duy trì 1 hiệp, đồng thời trong 1 hiệp khiến họ khi bị tấn công thường, có 27.5%→55% tỉ lệ (chịu trí lực ảnh hưởng) xóa trang thái tăng ích	ally_1	{cavalry,shield,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tran-ap-phong-cu.png}	2026-01-17 16:17:08.282	2026-01-17 16:17:08.282
234	tan-trung-tan-tri	Tấn Trung Tấn Trí	command	Chỉ Huy	S	50	\N	\N	Chuẩn bị 1 hiệp, làm cho tập thể quân địch (1-2 người) giảm 15% tốc độ bị Trí Lực ảnh hưởng) và rơi vào trạng thái Hỗn Loạn (tấn công và Chiến Pháp sẽ không phân biệt khi lựa chọn mục tiêu), duy trì 2 hiệp, và khiến cả thể quân Đông Minh nhận 1 lần Chống Đỡ, duy trì 1 hiệp (Xác suất phát động 35% → 50%)	enemy_1_2	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tan-trung-tan-tri.png}	2026-01-17 16:17:08.276	2026-01-17 16:17:08.276
235	su-tu-phan-tan	Sự Từ Phán Tẩn	command	Chỉ Huy	S	35	\N	\N	Gây cho nhóm địch (2-3 người) sát thương Binh Đạo (Tỷ lệ sát thương 59% → 118%) và giúp tỷ lệ phát động Chiến Pháp chủ động của bản thân tăng 7.5% → 15%, duy trì 2 hiệp, đồng thời có 50% xác suất khiến mục tiêu rơi vào trạng thái Đao Phán 2 hiệp, mỗi hiệp duy trì gây sát thương (Tỷ lệ sát thương 51% → 102%, chịu ảnh hưởng của Võ Lực hoặc Trí Lực cao nhất, bỏ qua Phòng Thủ)	enemy_2_3	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{su-tu-phan-tan.png}	2026-01-17 16:17:08.277	2026-01-17 16:17:08.277
237	ngu-loi-oanh-dinh	Ngũ Lôi Oanh Đỉnh	active	Chủ Động	S	45	\N	\N	Chuẩn bị 1 hiệp, gây ra cho một quân địch ngẫu nhiên công kích mưu lược (tỉ lệ sát thương 68%→136%, bị Trí lực ảnh hưởng) và có 30% tỉ lệ khiến họ vào trạng thái chấn động (không thể hành động), duy trì 1 hiệp, và kích hoạt 5 lần, mỗi lần chọn độc lập mục tiêu; Khi bản thân là Chủ Tướng, nếu mục tiêu ở trạng thái thủy công, bão cát, mỗi khi thêm một loại sẽ tăng 20% tỉ lệ chấn động	enemy_1	{}	{}	{}	\N	\N	{}	\N	needs_update	{ngu-loi-oanh-dinh.png}	2026-01-17 16:17:08.279	2026-01-17 16:17:08.279
238	tran-ach-phong-cu	Trận Ách Phong Cự	command	Chỉ huy	S	100	\N	\N	Mỗi hiệp có 50% tỉ lệ (chịu ảnh hưởng trí lực) khiến một quân ta (ưu tiên chọn phổ tướng ngoại chính mình) cứu viện tất cả phe ta và nhận trạng thái Nghị Ngự (mỗi hiệp hồi phục binh lực một lần, tỉ lệ trị liệu 98%→192%, chịu ảnh hưởng trí lực) duy trì 1 hiệp, đồng thời trong 1 hiệp khiến họ khi bị tấn công thương, có 27.5%→55% tỉ lệ (chịu trí lực ảnh hưởng) xóa trạng thái tăng ích	ally_1	{cavalry,shield,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tran-ach-phong-cu.png}	2026-01-17 16:17:08.281	2026-01-17 16:17:08.281
233	phan-menh-tu-lap	Phù Mệnh Tự Lập	passive	Bị động	S	100	\N	\N	Một hiệp chiến đầu bất kỳ trong 2 hiệp đầu, bản thân nhận Ngọc Tỷ, tăng 50% →100% xác suất Hồi Tâm và xác suất Kỳ Mưu, mỗi hiệp giảm dần cho đến khi hiệp chiến đầu thứ 8 giảm xuống còn 0, khi bản thân là Chủ tướng, tăng xác suất phát động Chiến Pháp chủ động (12.5%→25%, Chiến Pháp chuẩn bị là 17.5%→35%), đồng thời cũng sẽ giảm dần	self	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	complete	{phan-menh-tu-lap.png}	2026-01-17 16:17:08.274	2026-01-18 17:29:47.544
231	doc-tuyen-cu-thuc	Độc Tuyền Cự Thục	active	Chủ Động	S	60	\N	\N	Đối với cả thể quân địch (80% xác suất chọn Võ Tướng quân địch có Thống Soái cao nhất) thì triển 2 hiệp Kích Độc và khiến quân địch đã khi chịu phải tấn công thường sẽ cộng đồn 1 tầng Kích Độc, Kích Độc khi cộng đồn đến 3 tầng hoặc khi biến mất (bao gồm bị Tịnh Hóa) sẽ gây sát thương Mưu Lược cho toàn thể quân địch (tỷ lệ sát thương 75%→150%, mỗi 1 tầng Kích Độc tỷ lệ sát	enemy_1	{cavalry,shield,archer,spear,siege}	{"Đóa Tư Đại Vương"}	{}	innate	\N	{}	\N	complete	{doc-tuyen-cu-thuc.png}	2026-01-17 16:17:08.272	2026-01-21 07:20:30.809
25	banh-dau-thang-do	Đánh Đâu Thắng Đó	command	Chỉ Huy	S	30	\N	\N	Chuẩn bị 1 hiệp, phát động 1 lần tấn công Binh Đao cho toàn thể quân địch (tỷ lệ sát thương 123%→246%)	enemy_all	{cavalry,shield,archer}	{}	{"Hứa Chử","Mã Siêu"}	inherit	\N	{}	\N	complete	{banh-dau-thang-do-1.png,banh-dau-thang-do-2.png}	2026-01-17 16:17:08.008	2026-01-21 07:11:42.163
232	giam-thong-chan-xa	Giảm Thống Chấn Xa	command	Chỉ huy	S	100	inherited	\N	Trong chiến đấu, khi nhóm quân đồng minh gây ra trạng thái tiêu cực cho đối phương, có 19%→38% xác suất (chịu Trí Lực ảnh hưởng) khiến thời gian duy trì trạng thái tiêu cực tăng 1 hiệp (Hỗn Loạn và Nguy Bão vô hiệu), sau khi bản thân cộng kích phổ thông, gây thêm cho đơn thể quân địch mang trạng thái tiêu cực nhiều nhất cộng kích mưu lược (tỉ lệ sát thương 57%→114%, chịu Trí	ally_2	{cavalry,shield,archer,spear,siege}	{"Thư Thụ"}	{}	innate	\N	{}	\N	complete	{giam-thong-chan-xa.png}	2026-01-17 16:17:08.273	2026-01-21 07:28:54.731
241	van-vat-giao-diem	Vạn Vật Giao Điểm	command	Chỉ huy	S	100	\N	\N	Trong chiến đấu, hiệp sĩ lệ có 35%→70% xác suất (Trí lực ảnh hưởng) khiến sát thương Bình Đạo của võ tướng có Võ Lực cao nhất quân ta gây ra tăng 10%→20% (Trí Lực ảnh hưởng, duy trì đến trước khi mục tiêu thực hiện hành động), nếu mục tiêu không trong trạng thái Liên Kích, sẽ khiến mục tiêu có gắng phát động một lần tấn công thường lên đơn thế quân địch, nếu không thì	ally_2	{cavalry,shield,siege,spear}	{}	{}	\N	\N	{}	\N	needs_update	{van-vat-giao-diem.png}	2026-01-17 16:17:08.284	2026-01-17 16:17:08.284
243	lam-chien-tien-dang	Làm Chiến Tiền Đằng	active	Chủ động	S	100	\N	\N	Gây cho tập thể quân địch (2 người) nhận tấn công Binh Dao (tỷ lệ sát thương 75%→150%), sau đó bắn thân rơi vào trạng thái Suy Nhược (không thể gây ra sát thương), duy trì 1 hiệp	enemy_2	{cavalry,shield,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{lam-chien-tien-dang.png}	2026-01-17 16:17:08.287	2026-01-17 16:17:08.287
245	tuong-hanh-ky-tat	Tướng Hạnh Ký Tật	assault	Đột Kích	S	60	\N	\N	Sau khi tấn công thường, phát động 1 lần tấn công Binh Đao cho cả thể quân địch ngẫu nhiên (tỷ lệ sát thương 158%); nếu đánh trúng tướng chính quân địch sẽ làm cho mục tiêu rơi vào trạng thái Kế Tận (không thể phát động Chiến Pháp chủ động), duy trì 2 hiệp (Xác suất phát động 30%→60%)	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tuong-hanh-ky-tat.png}	2026-01-17 16:17:08.289	2026-01-17 16:17:08.289
247	thap-thang-thap-bai	Thập Thắng Thập Bại	command	Chỉ huy	S	100	inherited	\N	Chiến đấu 2 hiệp đầu, khiến Tướng Chính quân ta nhận trạng thái Quan Sát (miễn dịch tất cả hiệu ứng Không Chế) và sát thương phải chịu giảm 25%→50%; khi Tướng Chính quân ta phát động Chiến Pháp Chủ Động hoặc Chiến Pháp Đột Kích, bản thân có 30% xác suất trị liệu 1 cả thể quân ta (tỷ lệ trị liệu 25%→50%, chịu ảnh hưởng Trí Lực)	\N	{cavalry,shield,archer,spear,siege}	{}	{董昭}	inherit	\N	{}	\N	needs_update	{thap-thang-thap-bai.png}	2026-01-17 16:17:08.292	2026-01-17 16:17:08.292
248	xu-tu-bai-hoac	Xử Tự Bại Hoặc	active	Chủ động	S	35	\N	\N	Làm cho tập thể quân địch (2 người) có 30%→60% xác suất nhận trạng thái Đốt Cháy ngẫu nhiên (bị Trí Lực ảnh hưởng), Trúng Độc (bị Trí Lực ảnh hưởng), Bỏ Chạy (bị Võ Lực ảnh hưởng), mỗi hiệp gây ra sát thương liên tục (tỷ lệ sát thương 70%), mỗi loại trạng thái được giảm định riêng, duy trì 2 hiệp	enemy_2	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{xu-tu-bai-hoac.png}	2026-01-17 16:17:08.293	2026-01-17 16:17:08.293
240	bon-be-rung-dong	Bốn Bể Rụng Đông	command	Chỉ Huy	S	35	\N	\N	Phát động 2 lần công kích bình dao cho đơn thể quân địch (tỉ lệ sát thương 89%→178%), phân biệt gây cho mục tiêu sát thương bình dao phải chịu lần đầu tăng cao 15%→30% (chịu ảnh hưởng của võ lực) và trang thái Kế tấn (không thể phát động chiến pháp chủ động), duy trì 1 hiệp, mỗi lần chọn mục tiêu độc lập	enemy_1	{cavalry,shield,archer,spear,siege}	{}	{}	innate	\N	{}	\N	complete	{bon-be-rung-dong.png}	2026-01-17 16:17:08.283	2026-01-21 03:56:42.407
242	cam-quan-than-trong	Cầm Quân Thận Trọng	active	Chủ Động	S	35	\N	\N	Tăng 28→56 điểm Võ Lực của bản thân, duy trì 3 hiệp, và tạo ra một cú đáp mạnh vào nhóm quân địch (2 người) (tỉ lệ sát thương 92%→184%)	enemy_2	{cavalry,shield,archer,spear,siege}	{}	{}	innate	\N	{}	\N	complete	{cam-quan-than-trong.png}	2026-01-17 16:17:08.286	2026-01-21 04:27:09.169
246	dai-quan-quyet-chien	Đại Quan Quyết Chiến	active	Chủ động	S	50	\N	\N	Chuẩn bị 1 hiệp, xóa hiệu quả tăng ích của nhóm địch (2-3 người), và gây cho nhóm địch sát thương Binh Đao (Tỷ lệ sát thương 127.5%→255%)	enemy_2_3	{cavalry,shield,archer,spear,siege}	{}	{}	innate	\N	{}	\N	complete	{dai-quan-quyet-chien.png}	2026-01-17 16:17:08.291	2026-01-21 07:09:35.422
251	bien-da-thanh-vang	Biến Đá Thành Vàng	command	Chỉ đông	S	50	\N	\N	Khi phát động ở hiệp số lẻ, sẽ giúp Thống Soái của toàn quân ta tăng 34→68 điểm (khi hiệu lực với Vô Tướng Khan Vàng, chịu Mị Lực của Tướng Chính ảnh hưởng), và khiến Vô Tướng phẻ địch có Mị Lực thấp hơn Tướng Chính quân ta buộc vào trạng thái Cấm Trị Liệu, duy trì 2 hiệp; Khi phát động ở hiệp số chẵn, sẽ giúp sát thương Chiến Pháp Chủ Động và Chiến Pháp Đột Kích mà quân ta	ally_all	{cavalry,shield,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{bien-da-thanh-vang.png}	2026-01-17 16:17:08.297	2026-01-17 16:17:08.297
252	loi-dung-long-tin	Lợi Dụng Long Tín	command	Chỉ huy	S	100	\N	\N	Khi Tướng Chính phe ta khôi phục Binh Lực và bản thân không phải là Tướng Chính, giảm 10%→20% lượng Trí Liêu, bản thân sẽ hồi phục lượng trí liêu giảm đi đó, hiệp sở tê sẽ gây sát thương Mưu Lược cho nhóm quân địch (2 người) (tỷ lệ sát thương 45%→90%, Trí Lực ảnh hưởng), trong đó còn gây thêm sát thương Mưu Lược cho đơn vị có Trí Lực thấp hơn bản thân (tỷ lệ sát thương 45%→90%, Trí Lực ảnh hưởng)	enemy_2	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{loi-dung-long-tin.png}	2026-01-17 16:17:08.298	2026-01-17 16:17:08.298
253	phan-tat	Phấn Tật	command	Chỉ Huy	S	55	\N	\N	Tạo sát thương bình dạo cho cả thể quân địch (tỷ lệ sát thương 104%→208%) và khiến hạn Giao Binh Khí (không thể tăn công thường), duy trì 2 hiệp	ally_all	{cavalry,shield,archer,spear}	{}	{}	\N	\N	{}	\N	needs_update	{phan-tat.png}	2026-01-17 16:17:08.299	2026-01-17 16:17:08.299
256	thanh-nang	Thanh Nang	command	Chỉ huy	S	100	\N	\N	Chiến đấu 4 hiệp đầu, làm cho Tập thể quân ta (2 người) nhận hiệu ứng 20→40Thông Soái (bị Trí Lực ảnh hưởng) và hiệu ứng Cấp Cứu, mỗi lần chịu sát thương có 50% xác suất hồi phục Binh Lực nhất định (tỷ lệ Trí Liệu 48%→96%, bị Trí Lực ảnh hưởng)	ally_2	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{thanh-nang.png}	2026-01-17 16:17:08.303	2026-01-17 16:17:08.303
258	luc-lam-thuong-quoc	Lục Lâm Thương Quốc	internal	Nội chính	S	100	\N	\N	Khi ủy nhiệm làm Quan Chủ Chính, thời gian tăng cấp hạ tầng xây dựng giảm	\N	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{luc-lam-thuong-quoc.png}	2026-01-17 16:17:08.306	2026-01-17 16:17:08.306
255	dung-quan-tam-quan	Dũng Quán Tam Quản	assault	Đột Kích	S	35	\N	\N	Sau khi tấn công thường, lại phát động tấn công mạnh vào mục tiêu tấn công (tỷ lệ sát thương 90%→180%), và làm cho mục tiêu rơi vào trạng thái Chấn Động (không thể hành động), duy trì 1 hiệp	enemy_1	{spear,archer,cavalry,siege}	{"Nhan Lương"}	{}	innate	\N	{}	\N	complete	{dung-quan-tam-quan.png}	2026-01-17 16:17:08.302	2026-01-21 07:26:05.201
254	khieu-chien-quan-hung	Khiêu Chiến Quân Hùng	active	Chủ Động	S	35	innate	\N	Chuẩn bị 1 hiệp, gây cho tập thể quân địch (2 người) 1 lần tấn công Binh Dao (tỷ lệ sát thương 100%→200%), sau đó khiến sát thương Binh Dao bản thân gây ra tăng 12.5%→25%, sát thương Binh Dao phải chịu giảm (12.5%→25%, bị Võ Lực ảnh hưởng), duy trì 2 hiệp	enemy_2	{cavalry,shield,archer,spear,siege}	{"Hoa Hùng"}	{}	innate	\N	{}	\N	complete	{khieu-chien-quan-hung.png}	2026-01-17 16:17:08.301	2026-01-21 07:52:46.932
257	kim-don-mat-thuat	Kim Đơn Mật Thuật	command	Chỉ huy	S	100	\N	\N	2 hiệp đầu chiến đấu, toàn thể quân ta nhận 17.5%→35% hiệu quả Nể Tránh (có thể miễn dịch sát thương); Từ hiệp thứ 3 trở đi, toàn thể quân ta nhận trạng thái Nghị Ngời (mỗi hiệp hồi phục 1 lần Binh Lực, tỷ lệ hồi phục 29%→58%, Trí Lực ảnh hưởng), duy trì đến khi kết thúc chiến đấu	ally_all	{cavalry,shield,archer,spear,siege}	{"Tả Từ"}	{}	innate	\N	{}	\N	complete	{kim-don-mat-thuat.png}	2026-01-17 16:17:08.304	2026-01-21 09:18:08.356
263	quoc-sac	Quốc Sác	internal	Nội chính	S	100	\N	\N	Khi ủy nhiệm Vô Tướng làm Quan giao dịch, tỷ lệ giao dịch tăng 1.5%→3%	\N	{}	{}	{}	\N	\N	{}	\N	needs_update	{quoc-sac.png}	2026-01-17 16:17:08.312	2026-01-17 16:17:08.312
265	thuy-kinh-tien-sinh	Thủy Kính Tiên Sinh	internal	Nội chính	S	100	\N	\N	Khi ủy nhiệm Võ Tướng làm Sứ Thẩm Hỏi, tăng 4.5%→9% xác suất tìm ra thượng bậc cao	\N	{}	{}	{}	\N	\N	{}	\N	needs_update	{thuy-kinh-tien-sinh.png}	2026-01-17 16:17:08.314	2026-01-17 16:17:08.314
266	tram-doan-co-muu	Trâm Đoan Cổ Mưu	command	Chỉ Huy	S	40	\N	\N	Làm cho tập thể quân địch (2 người) giảm 30% Thống Soái, Trí Lực, duy trì 2 hiệp, và gây ra sát thương Mưu Lược (tỷ lệ sát thương 78%→156%, bị Trí Lực ảnh hưởng)	enemy_2	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{tram-doan-co-muu.png}	2026-01-17 16:17:08.315	2026-01-17 16:17:08.315
267	thien-huong	Thiên Hương	internal	Nội chính	S	100	\N	\N	Tăng 13.5%→27% mi lực của Võ Tướng	self	{}	{}	{}	\N	\N	{}	\N	needs_update	{thien-huong.png}	2026-01-17 16:17:08.316	2026-01-17 16:17:08.316
268	nhin-lai-xinh-tuoi	Nhịn Lại Xinh Tươi	active	Chủ động	S	45	\N	\N	Lấy trộm 17.5→35 điểm Trí Lực, Võ Lực, Thống Soái và Mí Lực của 1 Võ Tướng nam quân địch (chịu ảnh hưởng Mí Lực), chuyển sang cho bản thân và 1 quân đồng đội, duy trì 2 hiệp, có thể cộng dần 2 lần	enemy_1	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{nhin-lai-xinh-tuoi.png}	2026-01-17 16:17:08.318	2026-01-17 16:17:08.318
260	cong-than	Công Thần	command	Chỉ huy	S	100	\N	\N	Chiến đấu 3 hiệp đầu, làm cho toàn thể quân ta nhận trạng thái Tiên Công Trước (ưu tiên hành động), tương chính quân ta gây ra sát thương tăng 15%→30%, Phó tướng quân ta gây ra sát thương tăng 7.5%→15%; bắt đầu từ hiệp thứ 4, toàn thể quân ta gây ra sát thương giảm 15%, duy trì 2 hiệp	ally_all	{cavalry,shield,archer,spear,siege}	{"Hoàng Nguyệt Anh"}	{}	innate	\N	{}	\N	complete	{cong-than.png}	2026-01-17 16:17:08.308	2026-01-21 06:59:28.426
259	hue-chat-lan-tam	Huệ Chất Lan Tâm	command	Chỉ huy	S	100	\N	\N	Trong chiến đấu, Thống Soái toàn thể quân ta tăng 10→20 (chịu ảnh hưởng Trí Lực mỗi người), và bản thân nhận 7 tầng hiệu quả Lan Tâm, mỗi tầng khiến sát thương mà bản thân gây ra và phải chịu giảm 5%→10%; Khi bản thân chịu sát thương, tiêu hao 1 tầng hiệu quả Lan Tâm và có 50% xác suất (Trí Lực ảnh hưởng) Trí Liệu cả thể quân ta (tỷ lệ Trí Liệu 111%→222%, Trí Lực ảnh hưởng).	ally_all	{cavalry,shield,archer,spear,siege}	{"SP Hoàng Nguyệt Anh"}	{}	innate	\N	{}	\N	complete	{hue-chat-lan-tam.png}	2026-01-17 16:17:08.307	2026-01-21 07:43:21.949
262	huy-binh-muc-tuong	Huy Binh Mưu Thắng	command	Chỉ huy	S	100	\N	\N	Trong chiến đấu, mỗi khi quân ta tiêu hao Chống Đỡ, khiến cả thể quân ta hồi phục bình lực nhất định (tỉ lệ trị liệu 47% →94%, chịu Trí Lực ảnh hưởng), khi kết thúc thời gian duy trì Chống Đỡ nhưng chưa tiêu hao, sẽ khiến Võ Tướng có Võ Lực cao nhất quân ta phát động một lần sát thương bình dao với Võ Tướng ngẫu nhiên của quân địch (tỉ lệ sát thương 47%→94%), Trong 3 hiệp đấu, mỗi	ally_1	{cavalry,shield,archer,spear,siege}	{"Gia Cát Khác"}	{}	innate	\N	{}	\N	complete	{huy-binh-muc-tuong.png}	2026-01-17 16:17:08.311	2026-01-21 07:45:23.718
269	van-tu-anh-tong	Vạn Tử Ảnh Tông	command	Chỉ huy	S	100	\N	\N	Trong chiến đấu, khi bản thân sắp nhận phải tấn công thường, có 50% xác suất khiến một vỗ tướng cùng phe có Võ Lực cao nhất nhận hiệu ứng Phản kích (Võ Lực ảnh hưởng) (tỷ lệ sát thương 50%→100%) và trang thái Cấp cứu, khi nhận sát thương có 15%→30% xác suất hồi phục Binh lực (tỷ lệ trị liệu 50%→100%, Võ Lực ảnh hưởng), duy trì 1 hiệp, sau đó khiến mục tiêu gánh	\N	{spear,shield}	{}	{}	\N	\N	{}	\N	needs_update	{van-tu-anh-tong.png}	2026-01-17 16:17:08.319	2026-01-17 16:17:08.319
270	tieng-sao-du-am	Tiếng Sáo Dư Âm	command	Chỉ Huy	S	50	inherited	\N	Trị liệu một nhóm quân ta (2 người, tỉ lệ trị liệu 61%→122%, chịu ảnh hưởng của trí lực) và có 50% xác suất khiến sát thương chính mình và một quân đồng minh gây ra tăng cao 13%→26% (chịu ảnh hưởng của trí lực), sát thương phải chịu giảm 13%→26% (chịu ảnh hưởng của trí lực), giảm định riêng, duy trì 2 hiệp	ally_2	{cavalry,shield,archer,spear,siege}	{}	{}	inherit	\N	{}	\N	needs_update	{tieng-sao-du-am.png}	2026-01-17 16:17:08.32	2026-01-17 16:17:08.32
271	phuc-boi-thu-dich	Phục Bồi Thù Địch	command	Chủ động	A	45	\N	\N	Võ Tướng có Trí Lực cao nhất của quân ta và quân địch sẽ đồng thời gây ra tấn công Mưu Lược cho cả thể quân địch (tỷ lệ sát thương 59%→118%, bị Trí Lực ảnh hưởng)	enemy_all	{cavalry,shield,spear,siege}	{}	{}	\N	\N	{}	\N	needs_update	{phuc-boi-thu-dich.png}	2026-01-17 16:17:08.322	2026-01-17 16:17:08.322
135	bat-nhuc-su-menh	Bất Nhục Sứ Mệnh	active	Chủ Động	A	40	\N	\N	Gây cho cả thể quân địch 1 lần tấn công Binh Dao (tỷ lệ sát thương 110%→220%), và có 15%→30% xác suất phong trăng thái Chấn Động (không thể hành động), duy trì 1 hiệp	enemy_all	{cavalry,shield,archer,spear,siege}	{}	{"Phan Chương"}	inherit	\N	{}	\N	complete	{bat-nhuc-su-menh.png}	2026-01-17 16:17:08.152	2026-01-21 03:58:51.325
276	lam-co-che-thang	Lâm Cơ Chế Thắng	active	Chủ động	S	55	inherited	https://wiki.biligame.com/sgzzlb/%E4%B8%B4%E6%9C%BA%E5%88%B6%E8%83%9C	đối với nhóm địch (2 người)施加trạng thái trúng độc, mỗi lượt kéo dài gây sát thương (tỉ lệ sát thương 120%, chịu trí lực ảnh hưởng), kéo dài 2 lượt, nếu địch 已có trạng thái trúng độc, thì khiến 其ngẫu nhiên nhận được 灼烧 (chịu trí lực ảnh hưởng)、phản bội (chịu vũ lực hoặc trí lực nhất 高一项 ảnh hưởng, bỏ qua phòng ngự)、bão cát (chịu trí lực ảnh hưởng) trạng thái中 一种, mỗi lượt kéo dài gây sát thương (tỉ lệ sát thương 120%), kéo dài 2 lượt, 该chiến phápphát động后会rơi vào 1 lượt冷 lại	敌军群体（2人）	{cavalry,shield,archer,spear,siege}	{}	{伊籍,朵思大王}	inheritance	\N	\N	\N	needs_update	{}	2026-01-18 12:17:40.983	2026-01-18 12:17:40.983
70	lien-minh	Liên Minh	active	Chủ Động	S	55	\N	\N	Chọn một Vũ Tướng khác giới phế ta (60% xác suất ưu tiên chọn quân khác giới Trí Lực cao hơn, chịu ảnh hưởng Mị Lực), quy trí 2 hiệp, khi mục tiêu chịu hiệu quả Trí Liệu hoặc trang thái tính năng tăng ích, bản thân có 45%→90% xác suất nhận hiệu quả tương đồng (Hiệu quả Trí Liệu là 50%) (Xác suất phát động 30%→55%)	\N	{cavalry,shield,archer,spear,siege}	{}	{"Tôn Thượng Hương"}	inherit	\N	{}	\N	complete	{lien-minh.png}	2026-01-17 16:17:08.067	2026-01-18 18:51:11.507
287	khac-tuan-hoa-nhat	Khắc Tuân Họa Nhất	unknown	Không xác định	S	\N	innate	\N	\N	\N	{}	{蒋琬}	{}	innate	\N	\N	\N	needs_update	{}	2026-01-18 12:17:41.004	2026-01-18 12:17:41.004
437	cung-yeu-co	Cung Yêu Cơ	command	Chỉ huy	S	100	\N	\N	Trước khi phát động tấn công thường, gây cho một quân địch sát thương Binh Đao (tỷ lệ sát thương 61%→122%), khi bản thân có trạng thái Buff mang tính năng, gây thêm cho mục tiêu sát thương Binh Đao (tỷ lệ sát thương 10%→20% x số trạng thái) và tăng 9→18 Võ Lực, tối đa cộng dồn 5 lần	enemy_1	{archer,shield,spear,siege,cavalry}	{"Tôn Thượng Hương"}	{}	innate	\N	{}	\N	complete	{}	2026-01-18 18:53:05.604	2026-01-18 18:53:08.035
290	cuong-liet-bat-khuat	Cương Liệt Bất Khuất	passive	Bị động	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E5%88%9A%E7%83%88%E4%B8%8D%E5%B1%88	战斗中, khiến bản thân thống suấttăng 38 điểm, chịu sát thương vật lý khi có 40%xác suấtđối với nhóm địch (2 người) gây sát thương vật lý (tỉ lệ sát thương 84%)	自己	{cavalry,shield,archer,spear,siege}	{夏侯惇}	{夏侯惇}	innate	\N	\N	\N	needs_update	{}	2026-01-18 12:17:41.01	2026-01-18 12:17:41.01
294	dung-gia-dac-tien	Dũng Giả Đắc Tiền	assault	Đột kích	S	45	inherited	https://wiki.biligame.com/sgzzlb/%E5%8B%87%E8%80%85%E5%BE%97%E5%89%8D	普通tấn công, sau đó khiến bản thân nhận được 1 lần抵御, có thể miễn dịch sát thương, và khiến 下一个chiến pháp chủ động sát thươngtăng 80%	敌军单体	{cavalry,shield,archer,spear,siege}	{}	{张辽,张姬}	inheritance	\N	\N	\N	needs_update	{}	2026-01-18 12:17:41.015	2026-01-18 12:17:41.015
410	toc-thua-ky-loi	Tốc Thừa Kỳ Lợi	assault	Đột kích	S	35	inherited	https://wiki.biligame.com/sgzzlb/%E9%80%9F%E4%B9%98%E5%85%B6%E5%88%A9	普通tấn công, sau đó, đối với mục tiêuphát động一 lầnsát thương vật lý (tỉ lệ sát thương 185%), và kế cùng (không thể phát độngchiến pháp chủ động)1 lượt	敌军单体	{cavalry,shield,archer,spear,siege}	{}	{王元姬,sp朱儁}	inheritance	\N	\N	\N	needs_update	{}	2026-01-18 12:17:45.673	2026-01-18 12:17:45.673
60	dung-vo-than-thong	Dụng Võ Thần Thông	command	Chỉ Huy	S	100	innate	\N	Bắt đầu chiến đấu hiệp thứ 2, 4, 6, 8, sẽ lần lượt gây cho một nhóm quân địch (2 người) 45%→90%, 60%→120%, 67.5%→135%, 82.5%→165% sát thương Mưu Lược (bị Trí Lực ảnh hưởng)	enemy_2	{cavalry,shield,archer,spear,siege}	{}	{"Tư Mã Ý"}	inherit	\N	{}	\N	complete	{dung-vo-than-thong.png}	2026-01-17 16:17:08.054	2026-01-21 07:26:19.703
299	co-chi-ac-lai	Cổ Chi Ác Lai	command	Chỉ huy	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E5%8F%A4%E4%B9%8B%E6%81%B6%E6%9D%A5	quân ta 主将即将chịu 普通tấn công khi,bản thân 会đối với tấn công者进行一 lần猛击(tỉ lệ sát thương 80%), và khiến 其gây sát thương vật lýgiảm 18%, kéo dài 1 lượt,随后là quân ta 主将承担此 lần普通tấn công.	我军主将	{cavalry,shield,archer,spear,siege}	{典韦}	{典韦}	innate	\N	\N	\N	needs_update	{}	2026-01-18 12:17:41.021	2026-01-18 12:17:41.021
108	an-ui-quan-dan	An Ủi Quân Dân	command	Chỉ Huy	S	100	\N	\N	Chiến đấu 3 hiệp đầu, khiến sát thương của Tập thể quân ta (2 người) gây ra giảm 12%→24%, sát thương phải chịu giảm 12%→24% (bị Thống Soái ảnh hưởng), khi chiến đấu hiệp thứ 4, hồi phục Binh Lực (tỷ lệ Trí Lực 63%→126%, bị Trí Lực ảnh hưởng)	ally_2	{cavalry,shield,archer,spear,siege}	{}	{}	exchange	\N	{"Lưu Bị"}	1	complete	{an-ui-quan-dan.png}	2026-01-17 16:17:08.118	2026-01-21 03:44:57.377
118	anh-hung-tu-lap	Anh Thành Tự Thủ	active	Chủ Động	S	50	innate	\N	Hồi phục Binh Lực cho Tập thể quân ta (2 người) (tỷ lệ Trị Liệu 46%→92%, bị Trí Lực ảnh hưởng) và khiến mục tiêu nhân trang thái Nghị Ngời (mỗi hiệp hồi phục Binh Lực 1 lần, tỷ lệ Trị Liệu 31%→62%), duy trì 1 hiệp	ally_2	{shield,archer,spear}	{}	{}	exchange	\N	{"Tào Hồng","Tào Tháo","Từ Hoảng","Thẩm Phối","Trần Lâm"}	\N	complete	{anh-hung-tu-lap.png}	2026-01-17 16:17:08.131	2026-01-21 03:45:10.187
52	binh-vo-thuong-the	Binh Vô Thường Thế	passive	Bị động	S	100	\N	\N	Trong quá trình chiến đấu, khi bản thân tổng tiến hành 3 lần tấn công thường sẽ gây ra sát thương Mưu Lược cho mục tiêu tấn công (tỷ lệ sát thương 120% →240%, bị Trí Lực ảnh hưởng), và Trị Liệu bản thân (tỷ lệ Trí Liệu 90% →180%, bị Trí Lực ảnh hưởng)	enemy_1	{cavalry,shield,archer,spear,siege}	{}	{"Chúc Dung Phu Nhân"}	inherit	\N	{}	\N	complete	{binh-vo-thuong-the.png}	2026-01-17 16:17:08.044	2026-01-21 03:46:20.434
98	biet-minh-biet-ta	Biết Minh Biết Ta	command	Chỉ huy	S	100	\N	\N	Hiệp chiến đầu đầu tiên, khiến sát thương toàn thể địch ta gây ra giảm 25%→45% (Trí lực ảnh hưởng); Từ hiệp thứ 2 trở đi, mỗi hiệp có 25%→45% xác suất (Mị lực ảnh hưởng) khiến sát thương đồng đội phe ta gây ra tăng 3%→6% (chịu ảnh hưởng thuộc tính cao nhất), có thể cộng dồn, duy trì đến khi kết thúc chiến đấu	enemy_all	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	complete	{biet-minh-biet-ta.png}	2026-01-17 16:17:08.105	2026-01-21 03:47:46.139
319	tuong-mon-ho-nu	Tướng Môn Hổ Nữ	unknown	Không xác định	S	\N	innate	\N	\N	\N	{}	{关银屏}	{}	innate	\N	\N	\N	needs_update	{}	2026-01-18 12:17:41.047	2026-01-18 12:17:41.047
325	so-huong-phi-my	Sở Hướng Phi Mỹ	active	Chủ động	S	30	inherited	https://wiki.biligame.com/sgzzlb/%E6%89%80%E5%90%91%E6%8A%AB%E9%9D%A1	chuẩn bị 1 lượt, đối với toàn bộ địch phát động一 lầnsát thương vật lý (tỉ lệ sát thương 246%)	敌军全体	{cavalry,shield,spear,siege}	{}	{马超,许褚}	inheritance	\N	\N	\N	needs_update	{}	2026-01-18 12:17:41.055	2026-01-18 12:17:41.055
326	tai-bien-co-tiep	Tài Biện Cơ Tiệp	passive	Bị động	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E6%89%8D%E8%BE%A9%E6%9C%BA%E6%8D%B7	khiến bản thân 施加 灼烧、水攻、trúng độc、hoảng loạn、bão cát、phản bộitrạng tháisát thươngtăng 90%, nghỉ ngơi和急救 hồi phục量tăng 30%	自己	{cavalry,shield,archer,spear,siege}	{伊籍}	{伊籍}	innate	\N	\N	\N	needs_update	{}	2026-01-18 12:17:41.057	2026-01-18 12:17:41.057
327	chiet-xung-ngu-vu	Chiết Xung Ngự Vũ	assault	Đột kích	S	45	inherited	https://wiki.biligame.com/sgzzlb/%E6%8A%98%E5%86%B2%E5%BE%A1%E4%BE%AE	普通tấn công, sau đó, khiến ngẫu nhiên đơn thể địch giảm 100 điểmthống suất和trí lực, kéo dài 2 lượt; nếu bản thân không 是主将, thì thêm khiến quân ta 主将nhận được 2 lần抵御, có thể miễn dịch sát thương, kéo dài 2 lượt.	敌军单体	{cavalry,shield,archer,spear,siege}	{}	{典韦,太史慈}	inheritance	\N	\N	\N	needs_update	{}	2026-01-18 12:17:41.059	2026-01-18 12:17:41.059
230	biet-duoc-co-tot	Biệt Đuợc Gỗ Tốt	internal	Nội chính	S	100	innate	\N	Khi ủy nhiệm Vũ Tướng làm Quan Gỗ, sát lượng gỗ tăng 1.5%→3%	self	{cavalry,shield,archer,spear,siege}	{"Thái Ung"}	{}	innate	\N	{}	\N	complete	{biet-duoc-co-tot.png}	2026-01-17 16:17:08.27	2026-01-21 03:55:27.345
146	bach-mi	Bạch Mi	passive	Bị Động	A	100	\N	\N	Trong quá trình chiến đấu, xác suất phát động Chiến Pháp chủ động của bản thân tăng 6%→12%	self	{cavalry,shield,archer,spear,siege}	{}	{"Mã Lương"}	inherit	\N	{}	\N	complete	{bach-mi.png}	2026-01-17 16:17:08.166	2026-01-21 03:56:56.87
50	bach-ma-nghia-tong	Bạch Mã Nghĩa Tòng	troop	Binh Chủng	S	100	innate	\N	Tiền bãc Linh Cung thành Bạch Mã Nghĩa Tòng cung ngựa điều luyện: Tốc độ hành quân của đội quân tăng 25%→50%, toàn thể quân ta 2 hiệp chiến đầu đều sẽ nhận Tiền Công Trúc (ưu tiên hành động) và tỉ lệ phát động Chién Pháp Chủ Động tăng 5%→10%; Nếu Công Tôn Toản thống lĩnh, hiệu quả tăng tỉ lệ phát động sẽ chịu ánh hướng bởi Tốc Độ, và thời gian hiệu lực thay đổi thành 4 hiệp đấu	ally_all	{archer}	{"Công Tôn Toản"}	{"Công Tôn Toản"}	inherit	\N	{}	\N	complete	{bach-ma-nghia-tong.png}	2026-01-17 16:17:08.042	2026-01-21 03:57:45.04
220	bach-y-do-giang	Bạch Y Độ Giang	command	Chỉ huy	S	100	\N	\N	Chiến đấu hiệp đầu toàn thể quân ta nhận 1 lần chống đỡ, trong quá trình chiến đấu, khi bắn thần gây ra sát thương Binh Đao sẽ có 25%→50% xác suất khiến một quân địch Giao Binh Khí (không thể tiến hành tấn công thường), duy trì 2 hiệp, khi gây ra sát thương Mưu Lược có 25%→50% xác suất khiến một quân địch Kế Tận (không thể phát động Chiến Pháp chủ động), duy trì 1 hiệp, hiệu	ally_all	{spear,shield,cavalry,archer,siege}	{"Lữ Mông"}	{}	innate	\N	{}	\N	complete	{bach-y-do-giang.png}	2026-01-17 16:17:08.258	2026-01-21 03:58:06.436
31	bao-le-vo-nhan	Bạo Lệ Vô Nhân	assault	Đột Kích	S	35	\N	\N	Sau khi tấn công thường, lại phát động 1 lần tấn công Binh Dao vào mục tiêu (tỷ lệ sát thương 196%), và làm cho mục tiêu rơi vào trạng thái Hỗn Loạn (tấn công và Chiến Pháp sẽ không phân biệt khi chọn mục tiêu), duy trì 1 hiệp (Xác suất phát động 25%→35%)	enemy_1	{cavalry,shield,spear,siege,archer}	{}	{"Đổng Trác"}	inherit	\N	{}	\N	complete	{bao-le-vo-nhan-1.png,bao-le-vo-nhan-2.png}	2026-01-17 16:17:08.016	2026-01-21 03:58:31.861
420	ham-tran-dot-tap	Hãm Trận Đột Tập	passive	Bị động	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E9%99%B7%E9%98%B5%E7%AA%81%E8%A2%AD	战斗中, khiến bản thân 普通tấn côngmục tiêucó 68%xác suất锁定là địch 主将, bản thân 突击chiến pháp phát độngxác suấttăng 15%, và khiến bản thân 成功phát động突击chiến pháp后, đối với mục tiêuthêm phát động一 lầnsát thương vật lý (tỉ lệ sát thương 95%; bản thân là 主将 khi, nhận được 6%倒戈	自己	{cavalry,shield,archer,spear,siege}	{张辽}	{张辽}	innate	\N	\N	\N	needs_update	{}	2026-01-18 12:17:45.684	2026-01-18 12:17:45.684
264	be-nguyet	Bế Nguyệt	active	Chủ Động	S	75	\N	\N	Chọn cả thể quân địch Gánh Vác cho bản thân 12.5%→25% (bị Trí Lực ảnh hưởng) sát thương, và mục tiêu là khi quân địch Vô Lực cao nhất sẽ rơi vào trạng thái Hôn Loạn (tấn công và Chiến Pháp sẽ không phân biệt khi lựa chọn mục tiêu), nếu khi quân địch Trí Lực cao nhất sẽ rơi vào trạng thái Kế Tấn (không thể phát động Chiến Pháp chủ động), nếu không sẽ gây ra trạng thái	enemy_1	{cavalry,shield,archer,spear,siege}	{}	{}	innate	\N	{}	\N	complete	{be-nguyet.png}	2026-01-17 16:17:08.313	2026-01-21 04:26:13.701
172	co-giam-tien-thuc	Cơ Giám Tiên Thức	command	Chỉ huy	S	100	\N	\N	Hiệp chuẩn bị, khiến nhóm quân ta (2-3 người) nhận 2 lần Cảnh Giác, sau đó mỗi hiệp có 21%→42% xác suất (Trí Lực ảnh hưởng) khiến nhóm quân ta (2-3 người) nhận 1 lần Cảnh Giác (duy trì 3 hiệp, có thể nhận lại 4 lần): Khi sát thương phải chịu vượt quá 6% Binh Lực tối đa bản thân có thể mang (tối thiểu 100 linh), sẽ khiến sát thương lần này giảm 20%→40% (Trí Lực ảnh hưởng) và	ally_2_3	{cavalry,shield,archer,spear,siege}	{}	{}	innate	\N	{}	\N	complete	{co-giam-tien-thuc-1.png,co-giam-tien-thuc-2.png,co-giam-tien-thuc-3.png}	2026-01-17 16:17:08.199	2026-01-21 04:28:23.281
431	hoa-dung-nguyet-mao	Hoa Dung Nguyệt Mạo	unknown	\N	S	\N	innate	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	needs_update	{}	2026-01-18 12:18:09.828	2026-01-18 12:18:09.828
191	doc-nang-trom-dat	Dọc Ngang Trời Đất	command	Chỉ huy	S	100	\N	\N	Trong chiến đấu, khi toàn quân ta phát động chiến pháp Chủ Động và Đột Kích, bản thân có 35%→70% xác suất (Trí Lực ảnh hưởng) phát động tấn công Mưu Lược lên cả thể quân địch (tỷ lệ sát thương 50%→100%, Trí Lực ảnh hưởng), nếu do bản thân tự kích hoạt, sẽ có thêm 50% xác suất khiến nhóm quân ta (2 người) nhận 5%→10% Công Tâm (khi gây sát thương Mưu Lược sẽ	enemy_1	{cavalry,shield,archer,spear,siege}	{"SP Quách Gia"}	{}	innate	\N	{}	\N	complete	{doc-nang-trom-dat.png}	2026-01-17 16:17:08.223	2026-01-21 07:19:19.914
351	tri-ke	Trí Kế	unknown	Không xác định	S	\N	inherited	\N	\N	\N	{}	{}	{张纮,陈宫}	inheritance	\N	\N	\N	needs_update	{}	2026-01-18 12:17:45.591	2026-01-18 12:17:45.591
94	giai-phien-ve	Giải Phiền Vệ	troop	Binh Chủng	S	100	\N	\N	Tiền bạc Linh Thường thành Giải Phiền Ve vô địch: Trong chiến đấu, tốc độ toàn thể quân ta tăng 18→36 điểm, và sau khi Vô Tướng có tốc độ nhanh nhất phe ta tấn công thường, có 30% xác suất gây 1 lần sát thương lên cả thể quân địch (Tỷ lệ sát thương 18%→36%, Vô Lực hoặc Trí Lực bên nào cao hơn sẽ ảnh hưởng, Binh chủng 100% kèm theo 40% sát thương thuộc tính tốc độ của Tướng này), nếu không có hiệu lực thì sẽ phục hồi binh lực nhất định của cả thể quân ta (Tỷ lệ trị liệu 36%→72%, Vô Lực hoặc Trí Lực bên nào cao hơn sẽ ảnh hưởng); Nếu Hán Dương thống lĩnh, tỷ lệ sát thương có bản sẽ tăng đến 36%→72%	ally_all	{cavalry,archer,spear}	{}	{}	exchange	\N	{}	\N	complete	{giai-phien-ve.png}	2026-01-17 16:17:08.1	2026-01-21 07:27:49.289
357	mong-trung-thi-than	Mộng Trung Thí Thần	command	Chỉ huy	S	\N	inherited	https://wiki.biligame.com/sgzzlb/%E6%A2%A6%E4%B8%AD%E5%BC%91%E8%87%A3	战斗前2 lượt, nếu bản thân là 主将, thì khiến ngẫu nhiên 副将là bản thân 分担40%sát thương. 战斗第3 lượt起, bản thân 行动 khi nếu có 负面trạng thái, thì nhận được 50% xác suất phản kíchtrạng thái(tỉ lệ sát thương 150%), 直 đến 战斗kết thúc	自己	{cavalry,shield,archer,spear,siege}	{}	{曹操}	inheritance	\N	\N	\N	needs_update	{}	2026-01-18 12:17:45.599	2026-01-18 12:17:45.599
358	soc-huyet-tung-hoanh	Sóc Huyết Túng Hoành	passive	Bị động	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E6%A7%8A%E8%A1%80%E7%BA%B5%E6%A8%AA	战斗中, khiến bản thân nhận được 34 điểmvũ lực và 54%群攻 (普通tấn công khi đối với mục tiêu同部队其他võ tướnggây sát thương) hiệu quả, bản thân là 主将 khi, 群攻值là 60%	自己	{cavalry,shield,spear,siege}	{马超}	{马超}	innate	\N	\N	\N	needs_update	{}	2026-01-18 12:17:45.6	2026-01-18 12:17:45.6
359	tu-chien-bat-thoai	Tử Chiến Bất Thoái	passive	Bị động	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E6%AD%BB%E6%88%98%E4%B8%8D%E9%80%80	战斗中, khiến bản thân miễn dịch hỗn loạn; bản thân chịu sát thương khi, có 80% xác suất nhận được 一 tầng蓄威hiệu quả, có thể 积攒20 tầng; 普攻后, có 50% xác suất (chịu vũ lực ảnh hưởng)消耗一 tầng蓄威đối với đơn thể địch gây 一 lầnsát thương vật lý (tỉ lệ sát thương 130%), kích hoạt后có thể 继续判定, mỗi lầnkích hoạt后xác suấtgiảm 8%, mỗi lần普攻后tối đa kích hoạt5 lần	自己	{cavalry,shield,archer,spear,siege}	{sp庞德}	{sp庞德}	innate	\N	\N	\N	needs_update	{}	2026-01-18 12:17:45.602	2026-01-18 12:17:45.602
433	tuong-hanh-ky-tat-2	Tướng Hành Kỳ Tật	unknown	\N	S	\N	innate	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	needs_update	{}	2026-01-18 12:24:18.125	2026-01-18 12:24:18.125
250	giang-dong-trieu-ba-vuong	Giang Đông Triệu Bá Vương	passive	Bị động	S	100	\N	\N	Trong chiến đấu, bản thân mỗi hiệp có 25%→50% xác suất (ảnh hưởng bởi Võ Lực) gây cho 1 quân địch sát thương Binh Đao (tỷ lệ sát thương 96%→192%) và trị liệu Võ Tướng có Binh Lực thấp nhất quân ta (tỷ lệ Trị Liệu 28%→56%, ảnh hưởng bởi Võ Lực); khi bản thân là Chủ Tướng, 2 hiệp đầu, khiến sát thương phải chịu của 1 quân địch tăng 15%→30%	enemy_1	{cavalry,shield,archer,spear,siege}	{"Tôn Sách"}	{}	innate	\N	{}	\N	complete	{giang-dong-trieu-ba-vuong.png}	2026-01-17 16:17:08.296	2026-01-21 07:30:22.079
369	diem-truc-phong-phi	Diễm Trục Phong Phi	active	Chủ động	S	35	inherited	https://wiki.biligame.com/sgzzlb/%E7%84%B0%E9%80%90%E9%A3%8E%E9%A3%9E	đối với đơn thể địch gây sát thương mưu lược (tỉ lệ sát thương 226%, chịu trí lực ảnh hưởng) và chấn nhiếptrạng thái (không thể 行动), và có 40% xác suất khiến 其chịu sát thương mưu lượctăng 12% (chịu trí lực ảnh hưởng), kéo dài 1 lượt	敌军单体	{cavalry,shield,archer,spear,siege}	{}	{sp周瑜,sp诸葛亮}	inheritance	\N	\N	\N	needs_update	{}	2026-01-18 12:17:45.615	2026-01-18 12:17:45.615
124	hinh-nhat-tran	Hình Nhất Trận	formation	Pháp Trận	S	100	inherited	\N	Khi loại hình chiến pháp tự mang của 3 vũ tướng quân ta giống nhau, trong chiến đấu sẽ khiến thuộc tính cao nhất của bản thân tăng 30→60 điểm, sát thương gây ra và phải chịu của một nhóm quân đồng minh (2 người) giảm 15%→30%, hiệu ứng này mới hiệp giảm 5%→10%, sau khi hiệu ứng kết thúc, mỗi hiệp sẽ khiến sát thương gây ra tăng 8%→16%, sát thương phải chịu tăng 1%, có thể cộng dồn	ally_2_3	{cavalry,shield,archer,spear,siege}	{}	{}	exchange	\N	{}	\N	complete	{hinh-nhat-tran.png}	2026-01-17 16:17:08.139	2026-01-21 07:38:30.786
384	pha-quan-uy-thang	Phá Quân Uy Thắng	active	Chủ động	S	40	inherited	https://wiki.biligame.com/sgzzlb/%E7%A0%B4%E5%86%9B%E5%A8%81%E8%83%9C	giảm đơn thể địch 70 điểmthống suất (chịu vũ lực ảnh hưởng), kéo dài 2 lượt, và đối với 其gây sát thương vật lý (tỉ lệ sát thương 228%)	敌军单体	{cavalry,shield,archer,spear,siege}	{}	{满宠,王双}	inheritance	\N	\N	\N	needs_update	{}	2026-01-18 12:17:45.637	2026-01-18 12:17:45.637
386	than-co-mac-trac	Thần Cơ Mạc Trắc	active	Chủ động	S	65	innate	https://wiki.biligame.com/sgzzlb/%E7%A5%9E%E6%9C%BA%E8%8E%AB%E6%B5%8B	khiến đơn thể địch hỗn loạn2 lượt, và đối với bản thân 外 敌我toàn bộ 依 lần判定: nếu 未hỗn loạn thì có 35% xác suất khiến 其hỗn loạn2 lượt; đồng minh 已hỗn loạn khi, 解除其负面trạng thái (bản thân là 主将 khi, tăng 其12%gây sát thương, chịu trí lực ảnh hưởng, kéo dài 2 lượt); địch 已hỗn loạn khi, đối với 其gây sát thương mưu lược (tỉ lệ sát thương 175%, chịu trí lực ảnh hưởng)	双方全体	{cavalry,shield,archer,spear,siege}	{贾诩}	{贾诩}	innate	\N	\N	\N	needs_update	{}	2026-01-18 12:17:45.641	2026-01-18 12:17:45.641
29	lua-chay-ngun-ngut	Lửa Cháy Ngụn Ngút	active	Chủ Động	S	\N	\N	\N	Chuẩn bị 1 hiệp, phóng hỏa công vào toàn thể quân địch (tỷ lệ sát thương 51%→102%, bị Trí Lực ảnh hưởng), và phóng trạng thái Đốt Cháy, mỗi hiệp gây ra sát thương liên tục (tỷ lệ sát thương 36%→72%, bị Trí Lực ảnh hưởng), duy trì 2 hiệp	enemy_all	{spear,archer}	{}	{"Lục Tốn"}	inherit	\N	{}	\N	complete	{lua-chay-ngun-ngut.png}	2026-01-17 16:17:08.013	2026-01-18 14:37:04.808
202	kien-cuong-bat-quai	Kiên Cường Bất Khuất	passive	Bị động	S	100	\N	\N	Trong quá trình chiến đấu, làm cho Thông Soái của bạn thân tăng 19→38 điểm, khi chịu sát thương Binh Đao có 40% xác suất gây cho tập thể quân địch (2 người) nhận sát thương Binh Đao (tỷ lệ sát thương 42%→84%)	ally_2	{cavalry,shield,archer,spear,siege}	{}	{}	\N	\N	{}	\N	complete	{kien-cuong-bat-quai.png}	2026-01-17 16:17:08.237	2026-01-21 09:17:34.525
403	ho-si	Hổ Si	passive	Bị động	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E8%99%8E%E7%97%B4	战斗中, mỗi lượtchọn一名đơn thể địch, bản thân phát động 所có tấn công đều 会锁定该mục tiêu, đối với 其gây sát thươngtăng 33% (chịu vũ lực ảnh hưởng), nếu 击败mục tiêu会khiến bản thân nhận được 破阵trạng thái (gây sát thương khi bỏ qua mục tiêu thống suất和trí lực), 直 đến 战斗kết thúc	敌军全体	{cavalry,shield,archer,spear,siege}	{许褚}	{许褚}	innate	\N	\N	\N	needs_update	{}	2026-01-18 12:17:45.664	2026-01-18 12:17:45.664
408	van-tru-quyet-toan	Vận Trù Quyết Toán	active	Chủ động	S	55	inherited	https://wiki.biligame.com/sgzzlb/%E8%BF%90%E7%AD%B9%E5%86%B3%E7%AE%97	chuẩn bị 1 lượt, đối với toàn bộ địch phát động一 lầnsát thương mưu lược (tỉ lệ sát thương 176%, chịu trí lực ảnh hưởng)	敌军全体	{cavalry,archer}	{}	{张春华,荀攸}	inheritance	\N	\N	\N	needs_update	{}	2026-01-18 12:17:45.67	2026-01-18 12:17:45.67
86	ich-ki-kim-co	Ích Kì Kim Cố	active	Chủ Động	S	50	\N	\N	Chế điều toàn thể quân địch, khi bản thân sắp nhận phải tấn công thường, sẽ trí liệu 1 quân ta ngẫu nhiên (tỷ lệ trí liệu 37.5% → 75%, bị Võ Lực hoặc Trí Lực bên nào cao hơn thì sẽ ảnh hưởng), duy trì 1 hiệp	enemy_all	{}	{}	{"SP Lữ Mông"}	inherit	\N	{}	\N	complete	{ich-ki-kim-co.png}	2026-01-17 16:17:08.087	2026-01-18 17:02:19.683
429	ung-thi-lang-co	Ưng Thị Lang Cố	command	Chỉ huy	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E9%B9%B0%E8%A7%86%E7%8B%BC%E9%A1%BE	战斗前4 lượt, mỗi lượtcó 80% xác suất khiến bản thân nhận được 7%攻心 hoặc kỳ mưuxác suất (mỗi 种hiệu quảtối đa cộng dồn2 lần); 第5 lượt起, mỗi lượtcó 80% xác suất đối với 1-2个đơn thể địch gây sát thương mưu lược (tỉ lệ sát thương 154%, chịu trí lực ảnh hưởng); bản thân là 主将 khi, nhận được 16%kỳ mưuxác suất	先增益自身后对敌军群体（1-2人）	{cavalry,shield,archer,spear,siege}	{司马懿}	{司马懿}	innate	\N	\N	\N	needs_update	{}	2026-01-18 12:17:45.696	2026-01-18 18:54:06.614
426	mi-hoac	Mị Hoặc	passive	Bị động	S	\N	inherited	https://wiki.biligame.com/sgzzlb/%E9%AD%85%E6%83%91	bản thân chịu 普通tấn công khi, có 22.5%xác suấtkhiến tấn công者rơi vào hỗn loạn (tấn công和chiến phápkhông 差别chọnmục tiêu)、kế cùng (không thể phát độngchiến pháp chủ động)、suy yếu (không thể gây sát thương) trạng thái 一种, kéo dài 1 lượt, bản thân là 女性 khi, kích hoạtxác suấtthêm chịu trí lực ảnh hưởng	普攻来源	{cavalry,shield,archer,spear,siege}	{}	{甄姬,大乔}	inheritance	\N	\N	\N	needs_update	{}	2026-01-18 12:17:45.692	2026-01-18 12:17:45.692
434	than-co-dieu-toan	Thần Cơ Diệu Toán	command	Chỉ huy	S	100	\N	\N	Trong chiến đấu, khi nhóm quân địch (2 người) phát động Chiến Pháp Chủ Động, có 25%→35% xác suất khiến họ phát động thất bại và gây sát thương Mưu Lược cho họ (tỷ lệ sát thương 100%, Trí Lực ảnh hưởng, đồng thời còn tăng thêm dựa trên độ chênh lệch Trí Lực hai bên), khi bản thân là Tuống Chỉnh, tỷ lệ sát thương có bản tăng đến 128%	enemy_2	{cavalry,shield,archer,spear,siege}	{"Gia Cát Lượng"}	{}	innate	\N	{}	\N	complete	{}	2026-01-18 16:50:29.41	2026-01-18 16:50:38.037
435	nha-nho-dau-khau	Nhà Nho Đầu Khấu	command	Chỉ huy	S	100	\N	\N	Khi quân địch thứ phát động Chiến Pháp chủ động, có 15%→25% xác suất làm cho chúng giảm 5% xác suất phát động (bị Trí Lực ảnh hưởng), và tăng cho bản thân và quân Đồng Minh ngẫu nhiên 2%→4% xác suất phát động Chiến Pháp chủ động (bị Trí Lực ảnh hưởng), duy trì 1 hiệp	enemy_all	{cavalry,shield,archer,spear,siege}	{}	{"Gia Cát Lượng"}	inherit	\N	{}	\N	complete	{}	2026-01-18 16:55:03.208	2026-01-18 16:59:33.232
182	nam-man-cu-khoi	Nam Man Cự Khôi	command	Chỉ huy	S	100	\N	\N	Trong khi chiến đấu, mỗi hiệp hành động có 24,5%→49% xác suất gây cho toàn địch sát thương Bình Dao (tỷ lệ sát thương 53%→106%), nếu chưa có hiệu lực sẽ tăng 7% phát động xác suất, sau khi bản thân nhận phải 7 lần tấn công thường sẽ vào 1 hiệp trạng thái Chấn Động (không thể hành động); khi bản thân là Chủ Tướng, mỗi hiệp có 15% (mỗi thêm 1 Vũ Tướng Man Tộc trong	enemy_all	{cavalry,shield,archer,spear,siege}	{"Mạnh Hoạch"}	{}	innate	\N	{}	\N	complete	{nam-man-cu-khoi.png}	2026-01-17 16:17:08.211	2026-01-18 17:21:49.623
42	binh-phong	Binh Phong	active	Chủ Động	S	25	\N	\N	Khiến bản thân và một đồng đội tiến vào trạng thái Liên Kích (mỗi hiệp có thể công thường 2 lần), duy trì 1 hiệp (Xác suất phát động 25%→40%)	ally_1	{cavalry,archer,spear,siege}	{}	{"Trương Chiêu","Mạnh Hoạch"}	inherit	\N	{}	\N	complete	{binh-phong.png}	2026-01-17 16:17:08.031	2026-01-18 17:22:29.784
78	hinh-co-quan-luoc	Hình Cơ Quân Lược	active	Chủ Động	S	40	\N	\N	Gây cho cả thể quân địch 1 lần tấn công Binh Dao (tỷ lệ sát thương 105%→210%) và tấn công Mưu Lược (tỷ lệ sát thương 90%→180%, bị Trí Lực ảnh hưởng)	enemy_1	{cavalry,shield,archer,spear,siege}	{}	{"Viên Thuật","Khương Duy"}	inherit	\N	{}	\N	complete	{hinh-co-quan-luoc.png}	2026-01-17 16:17:08.077	2026-01-21 07:38:05.5
236	hoa-than-anh-phong	Hỏa Thần Anh Phong	command	Chỉ huy	S	100	\N	\N	Chiến đấu hiệp thứ 2-4, bản thân mỗi hiệp có 25%→50% xác suất (Võ Lực ảnh hưởng) phát động sát thương Binh Dao đến toàn thể quân địch (tỷ lệ sát thương 79%→158%) và Trị Liệu toàn thể quân ta (tỷ lệ Trị Liệu 79%→158%, Võ Lực ảnh hưởng); Từ hiệp thứ 5 trở đi, Võ Lực toàn thể quân tăng 10→20 (Võ Lực ảnh hưởng)	ally_all	{cavalry,shield,archer,spear,siege}	{"Chúc Dung Phu Nhân"}	{}	innate	\N	{}	\N	complete	{hoa-than-anh-phong.png}	2026-01-17 16:17:08.278	2026-01-21 07:40:45.962
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, display_name, email, avatar_url, role, created_at, updated_at) FROM stdin;
cmkmsh6ko000013598kycwzn9	Dev User	dev@localhost	\N	USER	2026-01-20 16:09:03.625	2026-01-20 16:09:37.21
\.


--
-- Name: skill_exchange_generals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.skill_exchange_generals_id_seq', 16, true);


--
-- Name: skill_inherit_generals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.skill_inherit_generals_id_seq', 137, true);


--
-- Name: skill_innate_generals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.skill_innate_generals_id_seq', 134, true);


--
-- Name: skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.skills_id_seq', 437, true);


--
-- Name: edit_suggestions edit_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.edit_suggestions
    ADD CONSTRAINT edit_suggestions_pkey PRIMARY KEY (id);


--
-- Name: formation_generals formation_generals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formation_generals
    ADD CONSTRAINT formation_generals_pkey PRIMARY KEY (id);


--
-- Name: formation_votes formation_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formation_votes
    ADD CONSTRAINT formation_votes_pkey PRIMARY KEY (id);


--
-- Name: formations formations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formations
    ADD CONSTRAINT formations_pkey PRIMARY KEY (id);


--
-- Name: generals generals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generals
    ADD CONSTRAINT generals_pkey PRIMARY KEY (id);


--
-- Name: line_up_formations line_up_formations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.line_up_formations
    ADD CONSTRAINT line_up_formations_pkey PRIMARY KEY (id);


--
-- Name: line_up_skill_resolutions line_up_skill_resolutions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.line_up_skill_resolutions
    ADD CONSTRAINT line_up_skill_resolutions_pkey PRIMARY KEY (id);


--
-- Name: line_ups line_ups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.line_ups
    ADD CONSTRAINT line_ups_pkey PRIMARY KEY (id);


--
-- Name: oauth_accounts oauth_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_accounts
    ADD CONSTRAINT oauth_accounts_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: skill_exchange_generals skill_exchange_generals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill_exchange_generals
    ADD CONSTRAINT skill_exchange_generals_pkey PRIMARY KEY (id);


--
-- Name: skill_inherit_generals skill_inherit_generals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill_inherit_generals
    ADD CONSTRAINT skill_inherit_generals_pkey PRIMARY KEY (id);


--
-- Name: skill_innate_generals skill_innate_generals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill_innate_generals
    ADD CONSTRAINT skill_innate_generals_pkey PRIMARY KEY (id);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: edit_suggestions_entity_type_entity_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX edit_suggestions_entity_type_entity_id_idx ON public.edit_suggestions USING btree (entity_type, entity_id);


--
-- Name: edit_suggestions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX edit_suggestions_status_idx ON public.edit_suggestions USING btree (status);


--
-- Name: formation_generals_formation_id_general_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX formation_generals_formation_id_general_id_key ON public.formation_generals USING btree (formation_id, general_id);


--
-- Name: formation_generals_formation_id_position_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX formation_generals_formation_id_position_key ON public.formation_generals USING btree (formation_id, "position");


--
-- Name: formation_votes_formation_id_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX formation_votes_formation_id_user_id_key ON public.formation_votes USING btree (formation_id, user_id);


--
-- Name: formations_is_public_is_curated_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX formations_is_public_is_curated_idx ON public.formations USING btree (is_public, is_curated);


--
-- Name: formations_rank_score_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX formations_rank_score_idx ON public.formations USING btree (rank_score);


--
-- Name: formations_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX formations_user_id_idx ON public.formations USING btree (user_id);


--
-- Name: generals_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX generals_slug_key ON public.generals USING btree (slug);


--
-- Name: line_up_formations_line_up_id_formation_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX line_up_formations_line_up_id_formation_id_key ON public.line_up_formations USING btree (line_up_id, formation_id);


--
-- Name: line_up_formations_line_up_id_position_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX line_up_formations_line_up_id_position_key ON public.line_up_formations USING btree (line_up_id, "position");


--
-- Name: line_up_skill_resolutions_line_up_id_skill_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX line_up_skill_resolutions_line_up_id_skill_id_key ON public.line_up_skill_resolutions USING btree (line_up_id, skill_id);


--
-- Name: line_ups_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX line_ups_user_id_idx ON public.line_ups USING btree (user_id);


--
-- Name: oauth_accounts_provider_provider_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX oauth_accounts_provider_provider_id_key ON public.oauth_accounts USING btree (provider, provider_id);


--
-- Name: skill_exchange_generals_skill_id_general_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX skill_exchange_generals_skill_id_general_id_key ON public.skill_exchange_generals USING btree (skill_id, general_id);


--
-- Name: skill_inherit_generals_skill_id_general_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX skill_inherit_generals_skill_id_general_id_key ON public.skill_inherit_generals USING btree (skill_id, general_id);


--
-- Name: skill_innate_generals_skill_id_general_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX skill_innate_generals_skill_id_general_id_key ON public.skill_innate_generals USING btree (skill_id, general_id);


--
-- Name: skills_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX skills_slug_key ON public.skills USING btree (slug);


--
-- Name: edit_suggestions edit_suggestions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.edit_suggestions
    ADD CONSTRAINT edit_suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: formation_generals formation_generals_formation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formation_generals
    ADD CONSTRAINT formation_generals_formation_id_fkey FOREIGN KEY (formation_id) REFERENCES public.formations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: formation_generals formation_generals_general_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formation_generals
    ADD CONSTRAINT formation_generals_general_id_fkey FOREIGN KEY (general_id) REFERENCES public.generals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: formation_generals formation_generals_skill_1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formation_generals
    ADD CONSTRAINT formation_generals_skill_1_id_fkey FOREIGN KEY (skill_1_id) REFERENCES public.skills(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: formation_generals formation_generals_skill_2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formation_generals
    ADD CONSTRAINT formation_generals_skill_2_id_fkey FOREIGN KEY (skill_2_id) REFERENCES public.skills(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: formation_votes formation_votes_formation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formation_votes
    ADD CONSTRAINT formation_votes_formation_id_fkey FOREIGN KEY (formation_id) REFERENCES public.formations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: formation_votes formation_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formation_votes
    ADD CONSTRAINT formation_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: formations formations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formations
    ADD CONSTRAINT formations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: generals generals_inherited_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generals
    ADD CONSTRAINT generals_inherited_skill_id_fkey FOREIGN KEY (inherited_skill_id) REFERENCES public.skills(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: generals generals_innate_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generals
    ADD CONSTRAINT generals_innate_skill_id_fkey FOREIGN KEY (innate_skill_id) REFERENCES public.skills(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: line_up_formations line_up_formations_formation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.line_up_formations
    ADD CONSTRAINT line_up_formations_formation_id_fkey FOREIGN KEY (formation_id) REFERENCES public.formations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: line_up_formations line_up_formations_line_up_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.line_up_formations
    ADD CONSTRAINT line_up_formations_line_up_id_fkey FOREIGN KEY (line_up_id) REFERENCES public.line_ups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: line_up_skill_resolutions line_up_skill_resolutions_line_up_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.line_up_skill_resolutions
    ADD CONSTRAINT line_up_skill_resolutions_line_up_id_fkey FOREIGN KEY (line_up_id) REFERENCES public.line_ups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: line_up_skill_resolutions line_up_skill_resolutions_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.line_up_skill_resolutions
    ADD CONSTRAINT line_up_skill_resolutions_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: line_ups line_ups_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.line_ups
    ADD CONSTRAINT line_ups_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: oauth_accounts oauth_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_accounts
    ADD CONSTRAINT oauth_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: skill_exchange_generals skill_exchange_generals_general_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill_exchange_generals
    ADD CONSTRAINT skill_exchange_generals_general_id_fkey FOREIGN KEY (general_id) REFERENCES public.generals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: skill_exchange_generals skill_exchange_generals_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill_exchange_generals
    ADD CONSTRAINT skill_exchange_generals_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: skill_inherit_generals skill_inherit_generals_general_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill_inherit_generals
    ADD CONSTRAINT skill_inherit_generals_general_id_fkey FOREIGN KEY (general_id) REFERENCES public.generals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: skill_inherit_generals skill_inherit_generals_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill_inherit_generals
    ADD CONSTRAINT skill_inherit_generals_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: skill_innate_generals skill_innate_generals_general_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill_innate_generals
    ADD CONSTRAINT skill_innate_generals_general_id_fkey FOREIGN KEY (general_id) REFERENCES public.generals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: skill_innate_generals skill_innate_generals_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill_innate_generals
    ADD CONSTRAINT skill_innate_generals_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 06xeoatey2ADPHvLCk4VzwwZ5PCctxsNrRLhCUr4GWs9usdXSMvtY0COlpeofkr

