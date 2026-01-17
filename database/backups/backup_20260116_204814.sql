--
-- PostgreSQL database dump
--

\restrict WQqxDwBWfkcPLGQHCBx2hIg8vBYxxXwKwbzbl6xlVRhdOQhtE1zf3YCqxFnYxMJ

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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: generals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.generals (
    id text NOT NULL,
    slug text NOT NULL,
    name_cn text NOT NULL,
    name_vi text NOT NULL,
    faction_id text NOT NULL,
    cost integer NOT NULL,
    wiki_url text,
    image text,
    image_full text,
    tags_cn text[],
    tags_vi text[],
    cavalry_grade text,
    shield_grade text,
    archer_grade text,
    spear_grade text,
    siege_grade text,
    innate_skill_id integer,
    inherited_skill_id integer,
    innate_skill_name text,
    inherited_skill_name text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'needs_update'::text NOT NULL
);


ALTER TABLE public.generals OWNER TO postgres;

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
    name_cn text NOT NULL,
    name_vi text NOT NULL,
    type_id text NOT NULL,
    type_name_cn text,
    type_name_vi text,
    quality text,
    trigger_rate integer,
    source_type text,
    wiki_url text,
    effect_cn text,
    effect_vi text,
    target text,
    target_vi text,
    army_types text[],
    innate_to_generals text[],
    inheritance_from_generals text[],
    acquisition_type text,
    exchange_type text,
    exchange_generals text[],
    exchange_count integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'needs_update'::text NOT NULL
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
-- Data for Name: generals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.generals (id, slug, name_cn, name_vi, faction_id, cost, wiki_url, image, image_full, tags_cn, tags_vi, cavalry_grade, shield_grade, archer_grade, spear_grade, siege_grade, innate_skill_id, inherited_skill_id, innate_skill_name, inherited_skill_name, created_at, updated_at, status) FROM stdin;
sp荀彧	s-p-tuan-uc	sp荀彧	S P Tuân Úc	wei	7	https://wiki.biligame.com/sgzzlb/Sp%E8%8D%80%E5%BD%A7	/images/generals/0_s_p_tuan_uc.jpg	\N	{武}	{Võ}	S	B	A	A	C	\N	\N	机鉴先识	竭力佐谋	2026-01-16 01:51:50.999	2026-01-16 01:51:50.999	needs_update
典韦	dien-vi	典韦	Điển Vi	wei	7	https://wiki.biligame.com/sgzzlb/%E5%85%B8%E9%9F%A6	/images/generals/1_dien_vi.jpg	\N	{"盾 武"}	{"Thuẫn [ ] Võ"}	B	S	C	A	C	\N	\N	古之恶来	折冲御侮	2026-01-16 01:51:51.002	2026-01-16 01:51:51.002	needs_update
贾诩	gia-hu	贾诩	Giả Hu	wei	7	https://wiki.biligame.com/sgzzlb/%E8%B4%BE%E8%AF%A9	/images/generals/2_gia_hu.jpg	\N	{"控 谋"}	{"Khống [ ] Mưu"}	S	A	S	C	A	\N	\N	神机莫测	伪书相间	2026-01-16 01:51:51.004	2026-01-16 01:51:51.004	needs_update
司马懿	tu-ma-y	司马懿	Tư Mã Ý	wei	7	https://wiki.biligame.com/sgzzlb/%E5%8F%B8%E9%A9%AC%E6%87%BF	/images/generals/3_tu_ma_y.jpg	\N	{谋}	{Mưu}	A	S	A	S	A	\N	\N	鹰视狼顾	用武通神	2026-01-16 01:51:51.006	2026-01-16 01:51:51.006	needs_update
曹操	tao-thao	曹操	Tào Tháo	wei	7	https://wiki.biligame.com/sgzzlb/%E6%9B%B9%E6%93%8D	/images/generals/4_tao_thao.jpg	\N	{"辅 盾"}	{"[辅] [ ] Thuẫn"}	S	S	A	A	B	\N	\N	乱世奸雄	梦中弑臣	2026-01-16 01:51:51.007	2026-01-16 01:51:51.007	needs_update
张辽	truong-lieu	张辽	Trương Liêu	wei	7	https://wiki.biligame.com/sgzzlb/%E5%BC%A0%E8%BE%BD	/images/generals/5_truong_lieu.jpg	\N	{武}	{Võ}	S	A	B	S	B	\N	\N	陷阵突袭	勇者得前	2026-01-16 01:51:51.009	2026-01-16 01:51:51.009	needs_update
sp庞德	s-p-bang-duc	sp庞德	S P Bàng Đức	wei	6	https://wiki.biligame.com/sgzzlb/Sp%E5%BA%9E%E5%BE%B7	/images/generals/6_s_p_bang_duc.jpg	\N	{武}	{Võ}	A	B	S	B	B	\N	\N	死战不退	忠勇义烈	2026-01-16 01:51:51.01	2026-01-16 01:51:51.01	needs_update
sp郭嘉	s-p-quach-gia	sp郭嘉	S P Quách Gia	wei	6	https://wiki.biligame.com/sgzzlb/Sp%E9%83%AD%E5%98%89	/images/generals/7_s_p_quach_gia.jpg	\N	{武}	{Võ}	A	A	A	B	B	\N	\N	经天纬地	先成其虑	2026-01-16 01:51:51.011	2026-01-16 01:51:51.011	needs_update
陈群	tran-quan	陈群	Trần Quần	wei	6	https://wiki.biligame.com/sgzzlb/%E9%99%88%E7%BE%A4	/images/generals/8_tran_quan.jpg	\N	{政}	{Chánh}	C	B	B	C	C	\N	\N	清流雅望	挫锐	2026-01-16 01:51:51.012	2026-01-16 01:51:51.012	needs_update
曹植	tao-thuc	曹植	Tào Thực	wei	6	https://wiki.biligame.com/sgzzlb/%E6%9B%B9%E6%A4%8D	/images/generals/9_tao_thuc.jpg	\N	{魅}	{[魅]}	B	B	C	C	B	\N	\N	七步成诗	守而必固	2026-01-16 01:51:51.013	2026-01-16 01:51:51.013	needs_update
许褚	hua-chu	许褚	Hứa Chử	wei	6	https://wiki.biligame.com/sgzzlb/%E8%AE%B8%E8%A4%9A	/images/generals/10_hua_chu.jpg	\N	{武}	{Võ}	A	S	B	S	C	\N	\N	虎痴	所向披靡	2026-01-16 01:51:51.014	2026-01-16 01:51:51.014	needs_update
张郃	truong	张郃	Trương [郃]	wei	6	https://wiki.biligame.com/sgzzlb/%E5%BC%A0%E9%83%83	/images/generals/11_truong.jpg	\N	{武}	{Võ}	A	S	B	S	A	\N	\N	大戟士	大戟士	2026-01-16 01:51:51.014	2026-01-16 01:51:51.014	needs_update
郝昭		郝昭	[郝] [昭]	wei	6	https://wiki.biligame.com/sgzzlb/%E9%83%9D%E6%98%AD	\N	\N	{"医 兼"}	{"[医] [ ] [兼]"}	B	S	A	B	S	\N	\N	金城汤池	横戈跃马	2026-01-16 01:51:51.015	2026-01-16 01:51:51.015	needs_update
曹仁	tao-nhan	曹仁	Tào Nhân	wei	6	https://wiki.biligame.com/sgzzlb/%E6%9B%B9%E4%BB%81	/images/generals/13_tao_nhan.jpg	\N	{盾}	{Thuẫn}	A	S	B	A	C	\N	\N	固若金汤	八门金锁阵	2026-01-16 01:51:51.016	2026-01-16 01:51:51.016	needs_update
甄姬	co	甄姬	[甄] Cơ	wei	6	https://wiki.biligame.com/sgzzlb/%E7%94%84%E5%A7%AC	/images/generals/14_co.jpg	\N	{魅}	{[魅]}	C	C	B	C	C	\N	\N	花容月貌	魅惑	2026-01-16 01:51:51.018	2026-01-16 01:51:51.018	needs_update
程昱	trinh-duc	程昱	Trình Dục	wei	6	https://wiki.biligame.com/sgzzlb/%E7%A8%8B%E6%98%B1	/images/generals/15_trinh_duc.jpg	\N	{谋}	{Mưu}	S	C	A	C	A	\N	\N	十面埋伏	守而必固	2026-01-16 01:51:51.019	2026-01-16 01:51:51.019	needs_update
荀彧	tuan-uc	荀彧	Tuân Úc	wei	6	https://wiki.biligame.com/sgzzlb/%E8%8D%80%E5%BD%A7	/images/generals/16_tuan_uc.jpg	\N	{政}	{Chánh}	C	C	B	C	C	\N	\N	王佐之才	四面楚歌	2026-01-16 01:51:51.02	2026-01-16 01:51:51.02	needs_update
荀攸	tuan-du	荀攸	Tuân Du	wei	6	https://wiki.biligame.com/sgzzlb/%E8%8D%80%E6%94%B8	/images/generals/17_tuan_du.jpg	\N	{"谋 辅"}	{"Mưu [ ] [辅]"}	S	B	S	C	B	\N	\N	十二奇谋	运筹决算	2026-01-16 01:51:51.021	2026-01-16 01:51:51.021	needs_update
徐晃	tu-hoang	徐晃	Từ Hoảng	wei	6	https://wiki.biligame.com/sgzzlb/%E5%BE%90%E6%99%83	/images/generals/18_tu_hoang.jpg	\N	{武}	{Võ}	A	S	C	A	B	\N	\N	长驱直入	合军聚众	2026-01-16 01:51:51.022	2026-01-16 01:51:51.022	needs_update
夏侯惇	ha-hau-don	夏侯惇	Hạ Hầu Đôn	wei	6	https://wiki.biligame.com/sgzzlb/%E5%A4%8F%E4%BE%AF%E6%83%87	/images/generals/19_ha_hau_don.jpg	\N	{战}	{Chiến}	S	A	C	A	B	\N	\N	刚烈不屈	绝地反击	2026-01-16 01:51:51.023	2026-01-16 01:51:51.023	needs_update
庞德	bang-duc	庞德	Bàng Đức	wei	6	https://wiki.biligame.com/sgzzlb/%E5%BA%9E%E5%BE%B7	/images/generals/20_bang_duc.jpg	\N	{武}	{Võ}	A	B	S	B	B	\N	\N	抬棺决战	暂避其锋	2026-01-16 01:51:51.023	2026-01-16 01:51:51.023	needs_update
钟会	chung-hoi	钟会	Chung Hội	wei	6	https://wiki.biligame.com/sgzzlb/%E9%92%9F%E4%BC%9A	/images/generals/21_chung_hoi.jpg	\N	{"谋 控"}	{"Mưu [ ] Khống"}	A	B	S	A	A	\N	\N	精练策数	文武双全	2026-01-16 01:51:51.024	2026-01-16 01:51:51.024	needs_update
满宠	man-sung	满宠	Mãn Sủng	wei	5	https://wiki.biligame.com/sgzzlb/%E6%BB%A1%E5%AE%A0	\N	\N	{辅}	{[辅]}	A	S	A	B	A	\N	\N	镇扼防拒	破军威胜	2026-01-16 01:51:51.025	2026-01-16 01:51:51.025	needs_update
王双	vuong-song	王双	Vương Song	wei	5	https://wiki.biligame.com/sgzzlb/%E7%8E%8B%E5%8F%8C	\N	\N	{战}	{Chiến}	A	S	C	A	C	\N	\N	震骇四境	破军威胜	2026-01-16 01:51:51.026	2026-01-16 01:51:51.026	needs_update
王元姬	vuong-co	王元姬	Vương [元] Cơ	wei	5	https://wiki.biligame.com/sgzzlb/%E7%8E%8B%E5%85%83%E5%A7%AC	\N	\N	{辅}	{[辅]}	A	B	A	S	C	\N	\N	垂心万物	速乘其利	2026-01-16 01:51:51.027	2026-01-16 01:51:51.027	needs_update
曹纯	tao	曹纯	Tào [纯]	wei	5	https://wiki.biligame.com/sgzzlb/%E6%9B%B9%E7%BA%AF	/images/generals/25_tao.jpg	\N	{武}	{Võ}	S	C	B	B	C	\N	\N	虎豹骑	虎豹骑	2026-01-16 01:51:51.028	2026-01-16 01:51:51.028	needs_update
于禁	vu-cam	于禁	Vu Cấm	wei	5	https://wiki.biligame.com/sgzzlb/%E4%BA%8E%E7%A6%81	/images/generals/26_vu_cam.jpg	\N	{武}	{Võ}	A	S	B	A	C	\N	\N	持军毅重	克敌制胜	2026-01-16 01:51:51.028	2026-01-16 01:51:51.028	needs_update
乐进	nhac-tien	乐进	Nhạc Tiến	wei	5	https://wiki.biligame.com/sgzzlb/%E4%B9%90%E8%BF%9B	/images/generals/27_nhac_tien.jpg	\N	{武}	{Võ}	S	A	B	S	S	\N	\N	临战先登	锋矢阵	2026-01-16 01:51:51.029	2026-01-16 01:51:51.029	needs_update
邓艾	dang-ngai	邓艾	Đặng Ngải	wei	5	https://wiki.biligame.com/sgzzlb/%E9%82%93%E8%89%BE	/images/generals/28_dang_ngai.jpg	\N	{控}	{Khống}	A	B	A	S	S	\N	\N	暗度陈仓	文武双全	2026-01-16 01:51:51.03	2026-01-16 01:51:51.03	needs_update
夏侯渊	ha-hau-uyen	夏侯渊	Hạ Hầu Uyên	wei	5	https://wiki.biligame.com/sgzzlb/%E5%A4%8F%E4%BE%AF%E6%B8%8A	/images/generals/29_ha_hau_uyen.jpg	\N	{武}	{Võ}	S	B	S	B	A	\N	\N	将行其疾	万箭齐发	2026-01-16 01:51:51.031	2026-01-16 01:51:51.031	needs_update
郭嘉	quach-gia	郭嘉	Quách Gia	wei	5	https://wiki.biligame.com/sgzzlb/%E9%83%AD%E5%98%89	/images/generals/30_quach_gia.jpg	\N	{辅}	{[辅]}	S	A	A	B	B	\N	\N	十胜十败	沉沙决水	2026-01-16 01:51:51.032	2026-01-16 01:51:51.032	needs_update
曹丕	tao-2	曹丕	Tào [丕]	wei	4	https://wiki.biligame.com/sgzzlb/%E6%9B%B9%E4%B8%95	/images/generals/25_tao.jpg	\N	{政}	{Chánh}	A	A	S	C	C	\N	\N	戮力上国	盛气凌敌	2026-01-16 01:51:51.033	2026-01-16 01:51:51.033	needs_update
张春华	truong-xuan-hoa	张春华	Trương Xuân Hoa	wei	3	https://wiki.biligame.com/sgzzlb/%E5%BC%A0%E6%98%A5%E5%8D%8E	/images/generals/32_truong_xuan_hoa.jpg	\N	{武}	{Võ}	A	A	A	C	B	\N	\N	沉断机谋	运筹决算	2026-01-16 01:51:51.034	2026-01-16 01:51:51.034	needs_update
刘备	luu-bi	刘备	Lưu Bị	shu	7	https://wiki.biligame.com/sgzzlb/%E5%88%98%E5%A4%87	/images/generals/33_luu_bi.jpg	\N	{"医 控"}	{"[医] [ ] Khống"}	S	S	A	A	C	\N	\N	仁德载世	义心昭烈	2026-01-16 01:51:51.034	2026-01-16 01:51:51.034	needs_update
庞统	bang-thong	庞统	Bàng Thống	shu	7	https://wiki.biligame.com/sgzzlb/%E5%BA%9E%E7%BB%9F	/images/generals/34_bang_thong.jpg	\N	{谋}	{Mưu}	C	B	S	A	B	\N	\N	连环计	乘敌不虞	2026-01-16 01:51:51.035	2026-01-16 01:51:51.035	needs_update
马超	ma-sieu	马超	Mã Siêu	shu	7	https://wiki.biligame.com/sgzzlb/%E9%A9%AC%E8%B6%85	/images/generals/35_ma_sieu.jpg	\N	{武}	{Võ}	S	B	B	S	B	\N	\N	槊血纵横	所向披靡	2026-01-16 01:51:51.036	2026-01-16 01:51:51.036	needs_update
诸葛亮	gia-cat-luong	诸葛亮	Gia Cát Lượng	shu	7	https://wiki.biligame.com/sgzzlb/%E8%AF%B8%E8%91%9B%E4%BA%AE	/images/generals/36_gia_cat_luong.jpg	\N	{"控 谋"}	{"Khống [ ] Mưu"}	C	B	S	S	S	\N	\N	神机妙算	舌战群儒	2026-01-16 01:51:51.037	2026-01-16 01:51:51.037	needs_update
关羽	quan-vu	关羽	Quan Vũ	shu	7	https://wiki.biligame.com/sgzzlb/%E5%85%B3%E7%BE%BD	/images/generals/37_quan_vu.jpg	\N	{"战 控"}	{"Chiến [ ] Khống"}	S	A	C	S	C	\N	\N	威震华夏	横扫千军	2026-01-16 01:51:51.038	2026-01-16 01:51:51.038	needs_update
sp诸葛亮	s-p-gia-cat-luong	sp诸葛亮	S P Gia Cát Lượng	shu	6	https://wiki.biligame.com/sgzzlb/Sp%E8%AF%B8%E8%91%9B%E4%BA%AE	/images/generals/38_s_p_gia_cat_luong.jpg	\N	{辅}	{[辅]}	C	B	S	S	S	\N	\N	锦囊妙计	焰逐风飞	2026-01-16 01:51:51.039	2026-01-16 01:51:51.039	needs_update
严颜	nghiem-nhan	严颜	Nghiêm Nhan	shu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E4%B8%A5%E9%A2%9C&action=edit&redlink=1	/images/generals/39_nghiem_nhan.jpg	\N	{"辅 控"}	{"[辅] [ ] Khống"}	B	A	S	A	B	\N	\N	誓守无降	一力拒守	2026-01-16 01:51:51.04	2026-01-16 01:51:51.04	needs_update
张苞	truong-bao	张苞	Trương Bao	shu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%BC%A0%E8%8B%9E&action=edit&redlink=1	\N	\N	{"战 辅"}	{"Chiến [ ] [辅]"}	A	A	B	S	C	\N	\N	枪舞如风	士争先赴	2026-01-16 01:51:51.041	2026-01-16 01:51:51.041	needs_update
关兴	quan-hung	关兴	Quan Hưng	shu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%85%B3%E5%85%B4&action=edit&redlink=1	\N	\N	{战}	{Chiến}	A	A	B	S	C	\N	\N	刀出如霆	士争先赴	2026-01-16 01:51:51.042	2026-01-16 01:51:51.042	needs_update
关银屏	quan-ngan	关银屏	Quan Ngân [屏]	shu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%85%B3%E9%93%B6%E5%B1%8F&action=edit&redlink=1	\N	\N	{"战 控"}	{"Chiến [ ] Khống"}	S	B	C	S	C	\N	\N	将门虎女	箕形阵	2026-01-16 01:51:51.043	2026-01-16 01:51:51.043	needs_update
马云禄	ma-van	马云禄	Mã Vân [禄]	shu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%A9%AC%E4%BA%91%E7%A6%84&action=edit&redlink=1	/images/generals/43_ma_van.jpg	\N	{武}	{Võ}	S	C	B	A	C	\N	\N	鸱苕英姿	乘敌不虞	2026-01-16 01:51:51.044	2026-01-16 01:51:51.044	needs_update
陈到	tran	陈到	Trần [到]	shu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%99%88%E5%88%B0&action=edit&redlink=1	/images/generals/44_tran.jpg	\N	{战}	{Chiến}	C	B	B	S	B	\N	\N	白毦兵	白毦兵	2026-01-16 01:51:51.045	2026-01-16 01:51:51.045	needs_update
姜维	khuong-duy	姜维	Khương Duy	shu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%A7%9C%E7%BB%B4&action=edit&redlink=1	/images/generals/45_khuong_duy.jpg	\N	{兼}	{[兼]}	S	A	S	A	C	\N	\N	义胆雄心	形机军略	2026-01-16 01:51:51.046	2026-01-16 01:51:51.046	needs_update
魏延	nguy-dien	魏延	Ngụy Diên	shu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%AD%8F%E5%BB%B6&action=edit&redlink=1	\N	\N	{战}	{Chiến}	A	S	B	S	C	\N	\N	奇兵间道	威谋靡亢	2026-01-16 01:51:51.047	2026-01-16 01:51:51.047	needs_update
黄忠	hoang-trung	黄忠	Hoàng Trung	shu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%BB%84%E5%BF%A0&action=edit&redlink=1	/images/generals/47_hoang_trung.jpg	\N	{战}	{Chiến}	A	S	S	A	C	\N	\N	百步穿杨	万箭齐发	2026-01-16 01:51:51.048	2026-01-16 01:51:51.048	needs_update
赵云	trieu-van	赵云	Triệu Vân	shu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E8%B5%B5%E4%BA%91&action=edit&redlink=1	/images/generals/48_trieu_van.jpg	\N	{战}	{Chiến}	S	A	A	S	C	\N	\N	一身是胆	横扫千军	2026-01-16 01:51:51.049	2026-01-16 01:51:51.049	needs_update
张飞	truong-phi	张飞	Trương Phi	shu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%BC%A0%E9%A3%9E&action=edit&redlink=1	/images/generals/49_truong_phi.jpg	\N	{武}	{Võ}	A	S	C	S	C	\N	\N	燕人咆哮	瞋目横矛	2026-01-16 01:51:51.05	2026-01-16 01:51:51.05	needs_update
蒋琬	tuong-uyen	蒋琬	Tưởng Uyển	shu	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E8%92%8B%E7%90%AC&action=edit&redlink=1	/images/generals/50_tuong_uyen.jpg	\N	{政}	{Chánh}	B	C	S	C	S	\N	\N	克遵画一	奇计良谋	2026-01-16 01:51:51.051	2026-01-16 01:51:51.051	needs_update
王平	vuong-binh	王平	Vương Bình	shu	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E7%8E%8B%E5%B9%B3&action=edit&redlink=1	/images/generals/51_vuong_binh.jpg	\N	{战}	{Chiến}	B	B	S	C	C	\N	\N	无当飞军	无当飞军	2026-01-16 01:51:51.052	2026-01-16 01:51:51.052	needs_update
徐庶	tu	徐庶	Từ [庶]	shu	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%BE%90%E5%BA%B6&action=edit&redlink=1	/images/generals/52_tu.jpg	\N	{谋}	{Mưu}	S	B	A	B	B	\N	\N	处兹不惑	暂避其锋	2026-01-16 01:51:51.053	2026-01-16 01:51:51.053	needs_update
张姬	truong-co	张姬	Trương Cơ	shu	4	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%BC%A0%E5%A7%AC&action=edit&redlink=1	/images/generals/53_truong_co.jpg	\N	{武}	{Võ}	A	B	B	S	C	\N	\N	奋矛英姿	勇者得前	2026-01-16 01:51:51.053	2026-01-16 01:51:51.053	needs_update
黄月英	hoang-nguyet-anh	黄月英	Hoàng Nguyệt Anh	shu	4	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%BB%84%E6%9C%88%E8%8B%B1&action=edit&redlink=1	/images/generals/54_hoang_nguyet_anh.jpg	\N	{辅}	{[辅]}	C	C	C	C	S	\N	\N	工神	锋矢阵	2026-01-16 01:51:51.054	2026-01-16 01:51:51.054	needs_update
法正	phap-chanh	法正	Pháp Chánh	shu	4	https://wiki.biligame.com/sgzzlb/index.php?title=%E6%B3%95%E6%AD%A3&action=edit&redlink=1	/images/generals/55_phap_chanh.jpg	\N	{"医 辅"}	{"[医] [ ] [辅]"}	B	S	A	A	A	\N	\N	以逸待劳	沉沙决水	2026-01-16 01:51:51.055	2026-01-16 01:51:51.055	needs_update
sp关羽	s-p-quan-vu	sp关羽	S P Quan Vũ	shu	7	https://wiki.biligame.com/sgzzlb/Sp%E5%85%B3%E7%BE%BD	/images/generals/56_s_p_quan_vu.jpg	\N	{战}	{Chiến}	S	A	C	S	C	\N	\N	水淹七军	忠勇义烈	2026-01-16 01:51:51.056	2026-01-16 01:51:51.056	needs_update
伊籍	y-tich	伊籍	Y Tịch	shu	6	https://wiki.biligame.com/sgzzlb/%E4%BC%8A%E7%B1%8D	\N	\N	{谋}	{Mưu}	S	B	B	A	C	\N	\N	才辩机捷	临机制胜	2026-01-16 01:51:51.057	2026-01-16 01:51:51.057	needs_update
孙尚香	ton-thuong-huong	孙尚香	Tôn Thượng Hương	wu	7	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%AD%99%E5%B0%9A%E9%A6%99&action=edit&redlink=1	/images/generals/58_ton_thuong_huong.jpg	\N	{武}	{Võ}	S	B	S	A	C	\N	\N	弓腰姬	结盟	2026-01-16 01:51:51.058	2026-01-16 01:51:51.058	needs_update
张纮	truong-2	张纮	Trương [纮]	wu	7	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%BC%A0%E7%BA%AE&action=edit&redlink=1	/images/generals/11_truong.jpg	\N	{政}	{Chánh}	C	C	B	C	A	\N	\N	奇施经略	智计	2026-01-16 01:51:51.059	2026-01-16 01:51:51.059	needs_update
张昭	truong-3	张昭	Trương [昭]	wu	7	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%BC%A0%E6%98%AD&action=edit&redlink=1	/images/generals/11_truong.jpg	\N	{政}	{Chánh}	C	C	C	B	C	\N	\N	功勋克举	兵锋	2026-01-16 01:51:51.061	2026-01-16 01:51:51.061	needs_update
陆逊	luc-ton	陆逊	Lục Tốn	wu	7	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%99%86%E9%80%8A&action=edit&redlink=1	/images/generals/61_luc_ton.jpg	\N	{谋}	{Mưu}	C	B	S	A	A	\N	\N	火烧连营	熯天炽地	2026-01-16 01:51:51.061	2026-01-16 01:51:51.061	needs_update
sp周瑜	s-p-chu-du	sp周瑜	S P Chu Du	wu	6	https://wiki.biligame.com/sgzzlb/SP%E5%91%A8%E7%91%9C	/images/generals/62_s_p_chu_du.jpg	\N	{谋}	{Mưu}	B	A	S	A	C	\N	\N	江天长焰	焰逐风飞	2026-01-16 01:51:51.063	2026-01-16 01:51:51.063	needs_update
凌统	lang-thong	凌统	Lăng Thống	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%87%8C%E7%BB%9F&action=edit&redlink=1	/images/generals/63_lang_thong.jpg	\N	{"辅 武"}	{"[辅] [ ] Võ"}	S	B	C	A	C	\N	\N	国士将风	横戈跃马	2026-01-16 01:51:51.063	2026-01-16 01:51:51.063	needs_update
鲁肃	lo-tuc	鲁肃	Lỗ Túc	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%B2%81%E8%82%83&action=edit&redlink=1	/images/generals/64_lo_tuc.jpg	\N	{"辅 医"}	{"[辅] [ ] [医]"}	B	A	A	A	A	\N	\N	济贫好施	奇计良谋	2026-01-16 01:51:51.064	2026-01-16 01:51:51.064	needs_update
孙权	ton-quyen	孙权	Tôn Quyền	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%AD%99%E6%9D%83&action=edit&redlink=1	/images/generals/65_ton_quyen.jpg	\N	{战}	{Chiến}	S	B	S	A	C	\N	\N	坐断东南	卧薪尝胆	2026-01-16 01:51:51.065	2026-01-16 01:51:51.065	needs_update
甘宁	cam-ninh	甘宁	Cam Ninh	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E7%94%98%E5%AE%81&action=edit&redlink=1	/images/generals/66_cam_ninh.jpg	\N	{武}	{Võ}	A	A	S	S	S	\N	\N	锦帆百翎	百骑劫营	2026-01-16 01:51:51.066	2026-01-16 01:51:51.066	needs_update
周泰	chu	周泰	Chu [泰]	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%91%A8%E6%B3%B0&action=edit&redlink=1	/images/generals/67_chu.jpg	\N	{盾}	{Thuẫn}	S	S	A	A	C	\N	\N	肉身铁壁	一力拒守	2026-01-16 01:51:51.067	2026-01-16 01:51:51.067	needs_update
吕蒙	lu	吕蒙	Lữ [蒙]	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%90%95%E8%92%99&action=edit&redlink=1	/images/generals/68_lu.jpg	\N	{"控 兼"}	{"Khống [ ] [兼]"}	B	B	A	S	S	\N	\N	白衣渡江	士别三日	2026-01-16 01:51:51.068	2026-01-16 01:51:51.068	needs_update
太史慈	thai-su-tu	太史慈	Thái Sử Từ	wu	6	https://wiki.biligame.com/sgzzlb/%E5%A4%AA%E5%8F%B2%E6%85%88	/images/generals/69_thai_su_tu.jpg	\N	{武}	{Võ}	S	C	S	B	C	\N	\N	神射	折冲御侮	2026-01-16 01:51:51.068	2026-01-16 01:51:51.068	needs_update
孙坚	ton-kien	孙坚	Tôn Kiên	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%AD%99%E5%9D%9A&action=edit&redlink=1	/images/generals/70_ton_kien.jpg	\N	{盾}	{Thuẫn}	A	S	B	A	C	\N	\N	十面埋伏	挫锐	2026-01-16 01:51:51.069	2026-01-16 01:51:51.069	needs_update
陆抗	luc-khang	陆抗	Lục Kháng	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%99%86%E6%8A%97&action=edit&redlink=1	/images/generals/71_luc_khang.jpg	\N	{"辅 盾"}	{"[辅] [ ] Thuẫn"}	A	B	S	A	S	\N	\N	校胜帷幄	乘胜长驱	2026-01-16 01:51:51.07	2026-01-16 01:51:51.07	needs_update
周瑜	chu-du	周瑜	Chu Du	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%91%A8%E7%91%9C&action=edit&redlink=1	/images/generals/72_chu_du.jpg	\N	{谋}	{Mưu}	B	A	S	A	C	\N	\N	神火计	风助火势	2026-01-16 01:51:51.071	2026-01-16 01:51:51.071	needs_update
黄盖	hoang	黄盖	Hoàng [盖]	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%BB%84%E7%9B%96&action=edit&redlink=1	/images/generals/73_hoang.jpg	\N	{"控 盾"}	{"Khống [ ] Thuẫn"}	B	A	S	A	B	\N	\N	苦肉计	风助火势	2026-01-16 01:51:51.072	2026-01-16 01:51:51.072	needs_update
程普	trinh-pho	程普	Trình Phổ	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E7%A8%8B%E6%99%AE&action=edit&redlink=1	/images/generals/74_trinh_pho.jpg	\N	{"盾 控"}	{"Thuẫn [ ] Khống"}	B	A	A	S	B	\N	\N	勇烈持重	克敌制胜	2026-01-16 01:51:51.073	2026-01-16 01:51:51.073	needs_update
孙策	ton-sach	孙策	Tôn Sách	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%AD%99%E7%AD%96&action=edit&redlink=1	/images/generals/75_ton_sach.jpg	\N	{武}	{Võ}	S	B	A	S	A	\N	\N	江东小霸王	破阵摧坚	2026-01-16 01:51:51.074	2026-01-16 01:51:51.074	needs_update
大乔	dai-kieu	大乔	Đại Kiều	wu	4	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%A4%A7%E4%B9%94&action=edit&redlink=1	/images/generals/76_dai_kieu.jpg	\N	{魅}	{[魅]}	C	C	B	C	C	\N	\N	国色	魅惑	2026-01-16 01:51:51.074	2026-01-16 01:51:51.074	needs_update
小乔	tieu-kieu	小乔	Tiểu Kiều	wu	3	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%B0%8F%E4%B9%94&action=edit&redlink=1	/images/generals/77_tieu_kieu.jpg	\N	{魅}	{[魅]}	C	C	B	C	C	\N	\N	天香	夺魂挟魄	2026-01-16 01:51:51.075	2026-01-16 01:51:51.075	needs_update
sp吕蒙	s-p-lu	sp吕蒙	S P Lữ [蒙]	wu	7	https://wiki.biligame.com/sgzzlb/index.php?title=Sp%E5%90%95%E8%92%99&action=edit&redlink=1	/images/generals/78_s_p_lu.jpg	\N	{"控 兼"}	{"Khống [ ] [兼]"}	B	B	A	S	S	\N	\N	溯江摇橹	益其金鼓	2026-01-16 01:51:51.076	2026-01-16 01:51:51.076	needs_update
马忠	ma-trung	马忠	Mã Trung	wu	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%A9%AC%E5%BF%A0&action=edit&redlink=1	\N	\N	{"战 控"}	{"Chiến [ ] Khống"}	C	A	S	A	A	\N	\N	暗箭难防	锋芒毕露	2026-01-16 01:51:51.077	2026-01-16 01:51:51.077	needs_update
sp朱儁	s-p-chu	sp朱儁	S P Chu [儁]	qun	7	https://wiki.biligame.com/sgzzlb/index.php?title=Sp%E6%9C%B1%E5%84%81&action=edit&redlink=1	\N	\N	{兼}	{[兼]}	C	B	S	B	A	\N	\N	围师必阙	速乘其利	2026-01-16 01:51:51.077	2026-01-16 01:51:51.077	needs_update
sp袁绍	s-p-vien-thieu	sp袁绍	S P Viên Thiệu	qun	7	https://wiki.biligame.com/sgzzlb/index.php?title=Sp%E8%A2%81%E7%BB%8D&action=edit&redlink=1	/images/generals/81_s_p_vien_thieu.jpg	\N	{战}	{Chiến}	B	A	S	B	S	\N	\N	高橹连营	箕形阵	2026-01-16 01:51:51.078	2026-01-16 01:51:51.078	needs_update
袁术	vien-thuat	袁术	Viên Thuật	qun	7	https://wiki.biligame.com/sgzzlb/index.php?title=%E8%A2%81%E6%9C%AF&action=edit&redlink=1	/images/generals/82_vien_thuat.jpg	\N	{兼}	{[兼]}	S	B	S	B	C	\N	\N	符命自立	形机军略	2026-01-16 01:51:51.079	2026-01-16 01:51:51.079	needs_update
孟获	manh-hoach	孟获	Mạnh Hoạch	qun	7	https://wiki.biligame.com/sgzzlb/%E5%AD%9F%E8%8E%B7	/images/generals/83_manh_hoach.jpg	\N	{"蛮 战 盾"}	{"[蛮] [ ] Chiến [ ] Thuẫn"}	S	S	B	A	A	\N	\N	南蛮渠魁	兵锋	2026-01-16 01:51:51.08	2026-01-16 01:51:51.08	needs_update
于吉	vu-cat	于吉	Vu Cát	qun	7	https://wiki.biligame.com/sgzzlb/%E4%BA%8E%E5%90%89	/images/generals/84_vu_cat.jpg	\N	{"仙 谋"}	{"Tiên [ ] Mưu"}	C	B	C	C	C	\N	\N	兴云布雨	杯蛇鬼车	2026-01-16 01:51:51.081	2026-01-16 01:51:51.081	needs_update
董卓	dong-trac	董卓	Đổng Trác	qun	7	https://wiki.biligame.com/sgzzlb/index.php?title=%E8%91%A3%E5%8D%93&action=edit&redlink=1	/images/generals/85_dong_trac.jpg	\N	{"战 盾"}	{"Chiến [ ] Thuẫn"}	A	S	S	B	C	\N	\N	酒池肉林	暴戾无仁	2026-01-16 01:51:51.082	2026-01-16 01:51:51.082	needs_update
吕布	lu-bo	吕布	Lữ Bố	qun	7	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%90%95%E5%B8%83&action=edit&redlink=1	/images/generals/86_lu_bo.jpg	\N	{武}	{Võ}	S	B	S	A	C	\N	\N	天下无双	一骑当千	2026-01-16 01:51:51.082	2026-01-16 01:51:51.082	needs_update
许攸	hua-du	许攸	Hứa Du	qun	6	https://wiki.biligame.com/sgzzlb/%E8%AE%B8%E6%94%B8	\N	\N	{辅}	{[辅]}	A	A	A	A	C	\N	\N	傲倪王侯	定谋贵决	2026-01-16 01:51:51.083	2026-01-16 01:51:51.083	needs_update
蔡邕	thai	蔡邕	Thái [邕]	qun	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E8%94%A1%E9%82%95&action=edit&redlink=1	\N	\N	{政}	{Chánh}	C	C	B	C	C	\N	\N	晓知良木	经术政要	2026-01-16 01:51:51.084	2026-01-16 01:51:51.084	needs_update
朵思大王	doa-tu-dai-vuong	朵思大王	Đóa Tư Đại Vương	qun	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E6%9C%B5%E6%80%9D%E5%A4%A7%E7%8E%8B&action=edit&redlink=1	\N	\N	{"蛮 谋"}	{"[蛮] [ ] Mưu"}	S	S	A	C	C	\N	\N	毒泉拒蜀	临机制胜	2026-01-16 01:51:51.085	2026-01-16 01:51:51.085	needs_update
沮授	thu-thu	沮授	Thư Thụ	qun	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E6%B2%AE%E6%8E%88&action=edit&redlink=1	\N	\N	{谋}	{Mưu}	B	S	S	A	A	\N	\N	监统震军	威谋靡亢	2026-01-16 01:51:51.087	2026-01-16 01:51:51.087	needs_update
田丰	dien-phong	田丰	Điền Phong	qun	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E7%94%B0%E4%B8%B0&action=edit&redlink=1	/images/generals/91_dien_phong.jpg	\N	{"控 辅"}	{"Khống [ ] [辅]"}	A	S	B	A	A	\N	\N	竭忠尽智	兵无常势	2026-01-16 01:51:51.088	2026-01-16 01:51:51.088	needs_update
吕玲绮	lu-linh	吕玲绮	Lữ Linh [绮]	qun	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%90%95%E7%8E%B2%E7%BB%AE&action=edit&redlink=1	\N	\N	{武}	{Võ}	S	B	S	A	C	\N	\N	狮子奋迅	绝地反击	2026-01-16 01:51:51.089	2026-01-16 01:51:51.089	needs_update
祝融夫人	chuc-dung-phu-nhan	祝融夫人	Chúc Dung Phu Nhân	qun	7	https://wiki.biligame.com/sgzzlb/index.php?title=%E7%A5%9D%E8%9E%8D%E5%A4%AB%E4%BA%BA&action=edit&redlink=1	/images/generals/93_chuc_dung_phu_nhan.jpg	\N	{"蛮 武 医"}	{"[蛮] [ ] Võ [ ] [医]"}	S	A	A	A	C	\N	\N	火神英风	兵无常势	2026-01-16 01:51:51.09	2026-01-16 01:51:51.09	needs_update
兀突骨	ngot-dot-cot	兀突骨	Ngột Đột Cốt	qun	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%85%80%E7%AA%81%E9%AA%A8&action=edit&redlink=1	/images/generals/94_ngot_dot_cot.jpg	\N	{"蛮 盾"}	{"[蛮] [ ] Thuẫn"}	S	S	C	B	C	\N	\N	藤甲兵	藤甲兵	2026-01-16 01:51:51.091	2026-01-16 01:51:51.091	needs_update
公孙瓒	cong-ton-toan	公孙瓒	Công Tôn Toản	qun	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%85%AC%E5%AD%99%E7%93%92&action=edit&redlink=1	/images/generals/95_cong_ton_toan.jpg	\N	{"辅 武"}	{"[辅] [ ] Võ"}	S	C	S	C	B	\N	\N	白马义从	白马义从	2026-01-16 01:51:51.092	2026-01-16 01:51:51.092	needs_update
袁绍	vien-thieu	袁绍	Viên Thiệu	qun	6	https://wiki.biligame.com/sgzzlb/index.php?title=%E8%A2%81%E7%BB%8D&action=edit&redlink=1	/images/generals/96_vien_thieu.jpg	\N	{战}	{Chiến}	B	A	S	B	S	\N	\N	累世立名	合军聚众	2026-01-16 01:51:51.092	2026-01-16 01:51:51.092	needs_update
张角	truong-giac	张角	Trương Giác	qun	6	https://wiki.biligame.com/sgzzlb/%E5%BC%A0%E8%A7%92	/images/generals/97_truong_giac.jpg	\N	{"黄 谋"}	{"Hoàng [ ] Mưu"}	A	S	S	B	A	\N	\N	五雷轰顶	黄天泰平	2026-01-16 01:51:51.093	2026-01-16 01:51:51.093	needs_update
张让	truong-4	张让	Trương [让]	qun	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%BC%A0%E8%AE%A9&action=edit&redlink=1	/images/generals/11_truong.jpg	\N	{谋}	{Mưu}	C	S	A	B	B	\N	\N	窃幸乘宠	竭力佐谋	2026-01-16 01:51:51.094	2026-01-16 01:51:51.094	needs_update
高览	cao	高览	Cao [览]	qun	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%AB%98%E8%A7%88&action=edit&redlink=1	/images/generals/99_cao.jpg	\N	{战}	{Chiến}	A	A	B	S	C	\N	\N	乘胜长驱	振军击营	2026-01-16 01:51:51.095	2026-01-16 01:51:51.095	needs_update
木鹿大王	moc-dai-vuong	木鹿大王	Mộc [鹿] Đại Vương	qun	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E6%9C%A8%E9%B9%BF%E5%A4%A7%E7%8E%8B&action=edit&redlink=1	/images/generals/100_moc_dai_vuong.jpg	\N	{"蛮 战"}	{"[蛮] [ ] Chiến"}	S	C	C	A	C	\N	\N	象兵	象兵	2026-01-16 01:51:51.096	2026-01-16 01:51:51.096	needs_update
李儒	ly-nho	李儒	Lý Nho	qun	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E6%9D%8E%E5%84%92&action=edit&redlink=1	/images/generals/101_ly_nho.jpg	\N	{"谋 辅"}	{"Mưu [ ] [辅]"}	S	B	A	B	B	\N	\N	鸩毒	四面楚歌	2026-01-16 01:51:51.096	2026-01-16 01:51:51.096	needs_update
高顺	cao-thuan	高顺	Cao Thuận	qun	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%AB%98%E9%A1%BA&action=edit&redlink=1	/images/generals/102_cao_thuan.jpg	\N	{盾}	{Thuẫn}	C	S	B	C	S	\N	\N	陷阵营	陷阵营	2026-01-16 01:51:51.097	2026-01-16 01:51:51.097	needs_update
马腾	ma	马腾	Mã [腾]	qun	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%A9%AC%E8%85%BE&action=edit&redlink=1	/images/generals/103_ma.jpg	\N	{战}	{Chiến}	S	C	B	C	C	\N	\N	西凉铁骑	西凉铁骑	2026-01-16 01:51:51.098	2026-01-16 01:51:51.098	needs_update
文丑	van-suu	文丑	Văn Sửu	qun	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E6%96%87%E4%B8%91&action=edit&redlink=1	/images/generals/104_van_suu.jpg	\N	{"战 控"}	{"Chiến [ ] Khống"}	A	A	S	A	C	\N	\N	登锋陷阵	破阵催坚	2026-01-16 01:51:51.099	2026-01-16 01:51:51.099	needs_update
华雄	hoa-hung	华雄	Hoa Hùng	qun	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%8D%8E%E9%9B%84&action=edit&redlink=1	/images/generals/105_hoa_hung.jpg	\N	{武}	{Võ}	S	B	B	A	C	\N	\N	搦战群雄	诱敌深入	2026-01-16 01:51:51.1	2026-01-16 01:51:51.1	needs_update
颜良	nhan-luong	颜良	Nhan Lương	qun	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%A2%9C%E8%89%AF&action=edit&redlink=1	/images/generals/106_nhan_luong.jpg	\N	{战}	{Chiến}	A	A	B	S	C	\N	\N	勇冠三军	盛气凌敌	2026-01-16 01:51:51.101	2026-01-16 01:51:51.101	needs_update
华佗	hoa-da	华佗	Hoa Đà	qun	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%8D%8E%E4%BD%97&action=edit&redlink=1	/images/generals/107_hoa_da.jpg	\N	{"仙 医"}	{"Tiên [ ] [医]"}	C	C	C	C	C	\N	\N	青囊	刮骨疗毒	2026-01-16 01:51:51.101	2026-01-16 01:51:51.101	needs_update
左慈	ta-tu	左慈	Tả Từ	qun	5	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%B7%A6%E6%85%88&action=edit&redlink=1	/images/generals/108_ta_tu.jpg	\N	{"仙 医"}	{"Tiên [ ] [医]"}	C	C	C	C	C	\N	\N	金丹秘术	杯蛇鬼车	2026-01-16 01:51:51.102	2026-01-16 01:51:51.102	needs_update
貂蝉	dieu-thuyen	貂蝉	Điêu Thuyền	qun	4	https://wiki.biligame.com/sgzzlb/index.php?title=%E8%B2%82%E8%9D%89&action=edit&redlink=1	/images/generals/109_dieu_thuyen.jpg	\N	{控}	{Khống}	B	C	B	C	C	\N	\N	闭月	倾国倾城	2026-01-16 01:51:51.103	2026-01-16 01:51:51.103	needs_update
陈宫	tran-cung	陈宫	Trần Cung	qun	4	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%99%88%E5%AE%AB&action=edit&redlink=1	/images/generals/110_tran_cung.jpg	\N	{谋}	{Mưu}	A	B	S	A	A	\N	\N	百计多谋	智计	2026-01-16 01:51:51.104	2026-01-16 01:51:51.104	needs_update
司马徵	tu-ma	司马徵	Tư Mã [徵]	qun	4	https://wiki.biligame.com/sgzzlb/index.php?title=%E5%8F%B8%E9%A9%AC%E5%BE%B5&action=edit&redlink=1	\N	\N	{魅}	{[魅]}	C	C	B	C	C	\N	\N	水镜先生	诱敌深入	2026-01-16 01:51:51.105	2026-01-16 01:51:51.105	needs_update
邹氏	trau-thi	邹氏	Trâu Thị	qun	3	https://wiki.biligame.com/sgzzlb/index.php?title=%E9%82%B9%E6%B0%8F&action=edit&redlink=1	\N	\N	{控}	{Khống}	C	B	C	C	C	\N	\N	顾盼生姿	先成其虑	2026-01-16 01:51:51.106	2026-01-16 01:51:51.106	needs_update
董白	dong-bach	董白	Đổng Bạch	qun	3	https://wiki.biligame.com/sgzzlb/index.php?title=%E8%91%A3%E7%99%BD&action=edit&redlink=1	\N	\N	{辅}	{[辅]}	C	C	C	B	C	\N	\N	云聚影从	益其金鼓	2026-01-16 01:51:51.107	2026-01-16 01:51:51.107	needs_update
蔡文姬	thai-van-co	蔡文姬	Thái Văn Cơ	qun	3	https://wiki.biligame.com/sgzzlb/index.php?title=%E8%94%A1%E6%96%87%E5%A7%AC&action=edit&redlink=1	/images/generals/114_thai_van_co.jpg	\N	{"医 辅"}	{"[医] [ ] [辅]"}	B	C	C	C	C	\N	\N	胡笳余音	夺魂挟魄	2026-01-16 01:51:51.108	2026-01-16 01:51:51.108	needs_update
\.


--
-- Data for Name: skill_exchange_generals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.skill_exchange_generals (id, skill_id, general_id, created_at) FROM stdin;
1	179	荀彧	2026-01-16 02:15:44.057
2	179	曹操	2026-01-16 02:15:44.057
15	6	姜维	2026-01-16 08:27:01.315
16	6	邓艾	2026-01-16 08:27:01.315
17	6	钟会	2026-01-16 08:27:01.315
\.


--
-- Data for Name: skill_inherit_generals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.skill_inherit_generals (id, skill_id, general_id, created_at) FROM stdin;
1	17	贾诩	2026-01-16 02:24:32.109
2	29	华佗	2026-01-16 02:42:30.67
12	5	夏侯渊	2026-01-16 08:34:19.309
13	5	黄忠	2026-01-16 08:34:19.309
14	11	陆抗	2026-01-16 08:40:54.749
15	11	高览	2026-01-16 08:40:54.749
16	3	吕布	2026-01-16 08:48:59.271
17	93	关羽	2026-01-16 08:50:55.671
18	93	赵云	2026-01-16 08:50:55.671
19	8	刘备	2026-01-16 08:55:09.09
22	10	庞统	2026-01-16 09:27:16.356
23	10	马云禄	2026-01-16 09:27:16.356
28	20	邹氏	2026-01-16 09:36:37.028
29	20	sp郭嘉	2026-01-16 09:36:37.028
30	40	徐晃	2026-01-16 10:46:22.835
31	40	袁绍	2026-01-16 10:46:22.835
32	25	祝融夫人	2026-01-16 10:51:25.81
33	25	田丰	2026-01-16 10:51:25.81
34	21	程普	2026-01-16 10:59:23.998
35	21	于禁	2026-01-16 10:59:23.998
\.


--
-- Data for Name: skill_innate_generals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.skill_innate_generals (id, skill_id, general_id, created_at) FROM stdin;
5	52	吕布	2026-01-16 08:00:36.352
6	181	刘备	2026-01-16 09:00:48.202
7	12	曹操	2026-01-16 09:16:17.32
\.


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.skills (id, slug, name_cn, name_vi, type_id, type_name_cn, type_name_vi, quality, trigger_rate, source_type, wiki_url, effect_cn, effect_vi, target, target_vi, army_types, innate_to_generals, inheritance_from_generals, acquisition_type, exchange_type, exchange_generals, exchange_count, created_at, updated_at, status) FROM stdin;
2	\N	一身是胆	Nhất Thân [是] [胆]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{赵云}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.783	2026-01-16 01:51:50.783	needs_update
4	\N	七步成诗	七 步 Thành 诗	internal	internal	Nội chính	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E4%B8%83%E6%AD%A5%E6%88%90%E8%AF%97	武将委任为锻造官时，提升锻造出高阶装备的几率9%	võ tướngbổ nhiệmlà quan rèn khi, tăng rèn ra cao cấptrang bị xác suất9%	\N	\N	{}	{曹植}	{曹植}	innate	\N	\N	\N	2026-01-16 01:51:50.786	2026-01-16 01:51:50.786	needs_update
7	\N	临机制胜	Lâm Cơ Chế Thắng	active	active	Chủ động	S	55	inherited	https://wiki.biligame.com/sgzzlb/%E4%B8%B4%E6%9C%BA%E5%88%B6%E8%83%9C	对敌军群体（2人）施加中毒状态，每回合持续造成伤害（伤害率120%，受智力影响），持续2回合，若敌军已有中毒状态，则使其随机获得灼烧（受智力影响）、叛逃（受武力或智力最高一项影响，无视防御）、沙暴（受智力影响）状态中的一种，每回合持续造成伤害（伤害率120%），持续2回合，该战法发动后会进入1回合冷却	đối với nhóm địch (2 người)施加trạng thái trúng độc, mỗi lượt kéo dài gây sát thương (tỉ lệ sát thương 120%, chịu trí lực ảnh hưởng), kéo dài 2 lượt, nếu địch 已có trạng thái trúng độc, thì khiến 其ngẫu nhiên nhận được 灼烧 (chịu trí lực ảnh hưởng)、phản bội (chịu vũ lực hoặc trí lực nhất 高一项 ảnh hưởng, bỏ qua phòng ngự)、bão cát (chịu trí lực ảnh hưởng) trạng thái中 一种, mỗi lượt kéo dài gây sát thương (tỉ lệ sát thương 120%), kéo dài 2 lượt, 该chiến phápphát động后会rơi vào 1 lượt冷 lại	敌军群体（2人）	Nhóm địch (2 người)	{cavalry,shield,archer,spear,siege}	{}	{伊籍,朵思大王}	inheritance	\N	\N	\N	2026-01-16 01:51:50.791	2026-01-16 01:51:50.791	needs_update
9	\N	义胆雄心	Nghĩa [胆] Hùng Tâm	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{姜维}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.794	2026-01-16 01:51:50.794	needs_update
13	\N	云聚影从	Vân [聚] [影] Tùng	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{董白}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.8	2026-01-16 01:51:50.8	needs_update
11	thua-thang-truong-khu	戮胜威将	Thừa Thắng Trường Khu	passive	被动	Bị động	S	100	inherited	\N	战斗开始时，每击破伤亡兵力造成5.5%→11%，叠加到战斗结束	Trong khi chiến đấu, mỗi hiệp khiến sát thương bần thần gây ra tăng 5.5%→11%, được cộng dồn đến khi kết thúc chiến đấu	self	Bản thân	{cavalry,shield,archer,spear,siege}	{}	{陆抗,高览}	inherit	\N	{}	\N	2026-01-16 01:51:50.797	2026-01-16 08:40:54.747	needs_update
8	nghia-tam-chieu-liet	疑心暗鬼	Nghĩa Tâm Chiêu Liệt	command	指挥	Chỉ huy	S	100	inherited	https://wiki.biligame.com/sgzzlb/%E4%B9%89%E5%BF%83%E6%98%AD%E7%83%88	在战斗中，当我方受到智力伤害时，使主动战法伤害减少10%→20%（受智力影响）；当我方兵力首次低于40%→80%时，使全军受到智力伤害时分担25%→50%伤害，持续2回合	Trong chiến đấu, khi bản thân tạo hiệu ứng Trí Liêu, khiến sát thương Chiến Pháp chủ động mục tiêu phải chịu giảm 10%→20% (chịu ảnh hưởng Trí Lực); duy trì 1 hiệp; Khi Binh Lực của bản thân lần đầu tiên thấp hơn 40%→80%, khiến toàn thể quân ta khi chịu sát thương sẽ chia đều 25%→50% sát thương, duy trì 2 hiệp	ally_all	Tất cả quân ta	{cavalry,shield,archer,spear,siege}	{}	{刘备}	inherit	\N	{}	\N	2026-01-16 01:51:50.793	2026-01-16 08:55:09.088	needs_update
6	lam-phong-quyet-dich	冷静决意	Lâm Phong Quyết Địch	active	主动	Chủ động	S	55	innate	https://wiki.biligame.com/sgzzlb/%E4%B8%B4%E6%88%98%E5%85%88%E7%99%BB	使自身进入连击和免疫缴兵状态，持续1回合（发动率30%→55%）	Khiến bản thân vào trạng thái Liên Kích và Miễn Dịch Giao Binh Khí, duy trì 1 hiệp (Xác suất phát động 30%→55%)	self	Bản thân	{cavalry,shield,archer,spear,siege}	{}	{}	exchange	exact	{钟会,邓艾,姜维}	\N	2026-01-16 01:51:50.789	2026-01-16 08:27:01.313	complete
12	loan-the-gian-hung	乱世奸雄	Loạn Thế Gian Hùng	command	command	Chỉ huy	S	100	innate	https://wiki.biligame.com/sgzzlb/%E4%B9%B1%E4%B8%96%E5%A5%B8%E9%9B%84	战斗中，使友军群体（2人）造成的兵刃伤害和谋略伤害提高16%（受智力影响），自己受到的兵刃伤害和谋略伤害降低18%（受智力影响），如果自己为主将，副将造成伤害时，会为主将恢复其伤害量10%的兵力	Trong quá trình chiến đấu, làm cho tập thể quân Đông Minh (2 người) tăng 16% sát thương gây ra (bị Trí Lực ảnh hưởng), sát thương bản thân phải chịu giảm 18% (bị Trí Lực ảnh hưởng), nếu bản thân là Chủ Tướng, khi Phó Tướng gây ra sát thương sẽ hồi phục Binh Lực cho Chủ Tướng tương đương 10% lượng sát thương	ally_all	Tất cả quân ta	{cavalry,shield,archer,spear,siege}	{曹操}	{}	innate	\N	{}	\N	2026-01-16 01:51:50.798	2026-01-16 09:16:17.318	complete
10	thua-dich-bat-ngu	恶来戏主	Thừa Địch Bất Ngu	active	主动	Chủ động	S	50	inherited	https://wiki.biligame.com/sgzzlb/%E4%B9%98%E6%95%8C%E4%B8%8D%E8%99%9E	准备1回合，使敌军单体陷入戏主状态（不能造成伤害），持续2回合，并使敌军单体陷入嘲讽状态（每回合恢复1次兵力，自身恢复54%~108%，承受嘲讽智力），持续2回合	Chuẩn bị 1 hiệp, khiến Tướng Chính quân địch rơi vào trạng thái Suy Nhược (không thể gây ra sát thương), duy trì 2 hiệp, và khiến Tướng Chính quân ta rơi vào trạng thái Nghị Ngợi (mỗi hiệp khôi phục 1 lần Binh Lực, tỷ lệ khôi phục 54%~108%, chịu ảnh hưởng Trí Lực), duy trì 2 hiệp	enemy_1	1 địch	{cavalry,shield,archer,spear,siege}	{}	{庞统,马云禄}	inherit	\N	{}	\N	2026-01-16 01:51:50.796	2026-01-16 09:27:16.354	complete
14	\N	五雷轰顶	五 Lôi 轰 顶	active	active	Chủ động	S	45	innate	https://wiki.biligame.com/sgzzlb/%E4%BA%94%E9%9B%B7%E8%BD%B0%E9%A1%B6	准备1回合，对敌军随机单体造成谋略攻击（伤害率136%，受智力影响）并由30%概率使其进入震慑状态（无法行动），持续1回合，共触发5次，每次独立选择目标；自身为主将时，若目标处于水攻状态、沙暴状态时，每多一种提高20%震慑概率	chuẩn bị 1 lượt, đối với địch ngẫu nhiên đơn thể gây sát thương mưu lược (tỉ lệ sát thương 136%, chịu trí lực ảnh hưởng), và 由30% xác suất khiến 其rơi vào chấn nhiếptrạng thái (không thể 行动), kéo dài 1 lượt, 共kích hoạt5 lần, mỗi lần独立chọnmục tiêu; bản thân là 主将 khi, nếu mục tiêu处于水攻trạng thái、bão cáttrạng thái khi, mỗi 多一种tăng 20%chấn nhiếp xác suất	敌军随机单体	địch ngẫu nhiên đơn thể	{cavalry,shield,archer,spear,siege}	{张角}	{张角}	innate	\N	\N	\N	2026-01-16 01:51:50.801	2026-01-16 01:51:50.801	needs_update
15	\N	仁德载世	仁 德 载 Thế	command	command	Chỉ huy	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E4%BB%81%E5%BE%B7%E8%BD%BD%E4%B8%96	每回合治疗我军群体（2人，治疗率68%，受智力影响），并使其受到伤害降低4%，持续1回合，且有10%概率对敌军单体施加虚弱（无法造成伤害）状态，持续1回合，自身为主将，施加虚弱状态的概率提高至25%	mỗi lượthồi phụcnhóm quân ta (2 người, hồi phục率68%, chịu trí lực ảnh hưởng), và khiến 其chịu sát thươnggiảm 4%, kéo dài 1 lượt, 且có 10% xác suất đối với đơn thể địch 施加suy yếu (không thể gây sát thương) trạng thái, kéo dài 1 lượt, bản thân là 主将, 施加trạng thái suy yếu xác suất tăng 至25%	我军群体（2人）	Nhóm quân ta (2 người)	{cavalry,shield,archer,spear,siege}	{刘备}	{刘备}	innate	\N	\N	\N	2026-01-16 01:51:50.802	2026-01-16 01:51:50.802	needs_update
16	\N	以逸待劳	[以] [逸] [待] [劳]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{法正}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.803	2026-01-16 01:51:50.803	needs_update
18	\N	倾国倾城	[倾] Quốc [倾] Thành	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{貂蝉}	inheritance	\N	\N	\N	2026-01-16 01:51:50.806	2026-01-16 01:51:50.806	needs_update
19	\N	傲倪王侯	傲 倪 王 侯	command	command	Chỉ huy	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E5%82%B2%E5%80%AA%E7%8E%8B%E4%BE%AF	战斗中，发现15个敌军破绽，破绽会分布在全体敌军中，敌军目标受到普通攻击时会触发一个破绽，使该目标降低3%武力、智力、统率、速度（受智力影响），可叠加，单个目标的破绽全部触发时，使其进入1回合虚弱状态且受到伤害提高15%（受智力影响），持续2回合，场上所有破绽触发后，敌军群体（2人）武力、智力、统率、速度降低20%（受智力影响）	战斗中, 发现15个địch 破绽, 破绽会分布 trong toàn bộ địch 中, địch mục tiêuchịu 普通tấn công khi 会kích hoạt一个破绽, khiến 该mục tiêugiảm 3%vũ lực、trí lực、thống suất、tốc độ (chịu trí lực ảnh hưởng), có thể cộng dồn, 单个mục tiêu 破绽全部kích hoạt khi, khiến 其rơi vào 1 lượttrạng thái suy yếu且chịu sát thươngtăng 15% (chịu trí lực ảnh hưởng), kéo dài 2 lượt, 场上所có 破绽kích hoạt后, nhóm địch (2 người) vũ lực、trí lực、thống suất、tốc độgiảm 20% (chịu trí lực ảnh hưởng)	敌军全体	Toàn bộ địch	{cavalry,shield,archer,spear,siege}	{许攸}	{许攸}	innate	\N	\N	\N	2026-01-16 01:51:50.808	2026-01-16 01:51:50.808	needs_update
22	\N	克遵画一	Khắc Tuân Họa Nhất	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{蒋琬}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.813	2026-01-16 01:51:50.813	needs_update
70	\N	所向披靡	Sở Hướng Phi Mỹ	active	active	Chủ động	S	30	inherited	https://wiki.biligame.com/sgzzlb/%E6%89%80%E5%90%91%E6%8A%AB%E9%9D%A1	准备1回合，对敌军全体发动一次兵刃攻击（伤害率246%）	chuẩn bị 1 lượt, đối với toàn bộ địch phát động一 lầnsát thương vật lý (tỉ lệ sát thương 246%)	敌军全体	Toàn bộ địch	{cavalry,shield,spear,siege}	{}	{马超,许褚}	inheritance	\N	\N	\N	2026-01-16 01:51:50.874	2026-01-16 01:51:50.874	needs_update
21	khac-dich-che-thang	克敌制胜	Khắc Địch Chế Thắng	assault	突击	Đột Kích	S	40	inherited	https://wiki.biligame.com/sgzzlb/%E5%85%8B%E6%95%8C%E5%88%B6%E8%83%9C	普通攻击之后，对攻击目标再次造成一次谋略伤害（伤害率180%，受智力影响）；若目标处于溃逃或中毒状态，则有70%概率使目标进入虚弱（无法造成伤害）状态，持续1回合	Sau khi tấn công thường, gây thêm cho mục tiêu tấn công 1 lần sát thương Mưu Lược (tỉ lệ sát thương 90%→180%, bị Trí Lực ảnh hưởng); nếu mục tiêu đang ở trong 1/3 trạng thái Bó Chạy, Trúng Độc hoặc Đốt Cháy, thì sẽ có 85% xác suất khiến mục tiêu rơi vào trạng thái Suy Nhược (không thể gây ra sát thương), duy trì 1 hiệp	enemy_1	Một quân địch	{cavalry,shield,archer,spear,siege}	{}	{于禁,程普}	inherit	\N	{}	\N	2026-01-16 01:51:50.811	2026-01-16 10:59:23.996	complete
20	tien-thanh-ky-lu	进圣纪律	Tiên Thành Kỳ Lự	assault	突击	Đột Kích	S	50	inherited	https://wiki.biligame.com/sgzzlb/%E5%85%88%E6%88%90%E5%85%B6%E8%99%91	战法发动后，对目标造成1次谋略攻击伤害(伤害率72.5%→145%，受智力影响)，同时帮助确定使用圣王主动的武将提高7.5%→15%	Sau khi tấn công thường, sẽ gây thêm cho mục tiêu tấn công 1 lần tấn công Mưu Lược (tỉ lệ sát thương 72.5%→145%, bị Trí Lực ảnh hưởng), đồng thời giúp xác suất dùng Chiến Pháp Chủ Động của bản thân tăng 7.5%→15%, duy trì 1 hiệp	enemy_1	Một quân địch	{cavalry,shield,archer,spear,siege}	{}	{sp郭嘉,邹氏}	inherit	\N	{}	\N	2026-01-16 01:51:50.81	2026-01-16 09:36:37.024	complete
23	\N	八门金锁阵	八 门 金 锁 Trận	formation	formation	Trận pháp	S	\N	inherited	https://wiki.biligame.com/sgzzlb/%E5%85%AB%E9%97%A8%E9%87%91%E9%94%81%E9%98%B5	战斗前3回合，使敌军群体（2人）造成的伤害降低30%（受智力影响），并使我军主将获得先攻状态（优先行动）	战斗前3 lượt, khiến nhóm địch (2 người) gây sát thươnggiảm 30% (chịu trí lực ảnh hưởng), và khiến quân ta 主将nhận được trạng thái tiên công (优先行动)	我军全体	Toàn bộ quân ta	{cavalry,shield,archer,spear,siege}	{}	{曹仁}	inheritance	\N	\N	\N	2026-01-16 01:51:50.814	2026-01-16 01:51:50.814	needs_update
24	\N	兴云布雨	兴 云 布 雨	command	command	Chỉ huy	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E5%85%B4%E4%BA%91%E5%B8%83%E9%9B%A8	战斗第2回合开始，使敌军全体进入水攻状态，每回合持续造成伤害（伤害率72%，受智力影响），并使其受到伤害增加10%，持续5回合	战斗第2 lượtbắt đầu, khiến toàn bộ địch rơi vào 水攻trạng thái, mỗi lượt kéo dài gây sát thương (tỉ lệ sát thương 72%, chịu trí lực ảnh hưởng), và khiến 其chịu sát thươngtăng thêm 10%, kéo dài 5 lượt	敌军全体	Toàn bộ địch	{cavalry,shield,archer,spear,siege}	{于吉}	{于吉}	innate	\N	\N	\N	2026-01-16 01:51:50.816	2026-01-16 01:51:50.816	needs_update
26	\N	兵锋	Binh Phong	active	active	Chủ động	S	35	inherited	https://wiki.biligame.com/sgzzlb/%E5%85%B5%E9%94%8B	使自己及友军单体进入连击（每回合可以普通攻击2次）状态，持续1回合	khiến bản thân và đồng minh đơn thể rơi vào liên kích (mỗi lượtcó thể 普通tấn công2 lần) trạng thái, kéo dài 1 lượt	自己及友军单体	bản thân và đồng minh đơn thể	{archer}	{}	{孟获,张昭}	inheritance	\N	\N	\N	2026-01-16 01:51:50.818	2026-01-16 01:51:50.818	needs_update
27	\N	刀出如霆	Đao [出] [如] [霆]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{关兴}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.819	2026-01-16 01:51:50.819	needs_update
28	\N	刚烈不屈	Cương Liệt Bất Khuất	passive	passive	Bị động	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E5%88%9A%E7%83%88%E4%B8%8D%E5%B1%88	战斗中， 使自己统率提升38点，受到兵刃伤害时有40%几率对敌军群体（2人）造成兵刃伤害（伤害率84%）	战斗中, khiến bản thân thống suấttăng 38 điểm, chịu sát thương vật lý khi có 40%xác suấtđối với nhóm địch (2 người) gây sát thương vật lý (tỉ lệ sát thương 84%)	自己	bản thân	{cavalry,shield,archer,spear,siege}	{夏侯惇}	{夏侯惇}	innate	\N	\N	\N	2026-01-16 01:51:50.821	2026-01-16 01:51:50.821	needs_update
30	\N	功勋克举	[功] [勋] Khắc [举]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{张昭}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.823	2026-01-16 01:51:50.823	needs_update
31	\N	勇冠三军	Dũng Quan Tam Quân	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{颜良}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.825	2026-01-16 01:51:50.825	needs_update
32	\N	勇烈持重	Dũng Liệt [持] [重]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{程普}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.826	2026-01-16 01:51:50.826	needs_update
33	\N	勇者得前	Dũng Giả Đắc Tiền	assault	assault	Đột kích	S	45	inherited	https://wiki.biligame.com/sgzzlb/%E5%8B%87%E8%80%85%E5%BE%97%E5%89%8D	普通攻击之后使自己获得1次抵御，可免疫伤害，并使下一个主动战法的伤害提升80%	普通tấn công, sau đó khiến bản thân nhận được 1 lần抵御, có thể miễn dịch sát thương, và khiến 下一个chiến pháp chủ động sát thươngtăng 80%	敌军单体	Đơn thể địch	{cavalry,shield,archer,spear,siege}	{}	{张辽,张姬}	inheritance	\N	\N	\N	2026-01-16 01:51:50.827	2026-01-16 01:51:50.827	needs_update
34	\N	十二奇谋	Thập 二 Kỳ Mưu	active	active	Chủ động	S	45	innate	https://wiki.biligame.com/sgzzlb/%E5%8D%81%E4%BA%8C%E5%A5%87%E8%B0%8B	移除敌军群体（1-2）人增益状态，提高我军全体1回合6%主动战法发动率（受智力影响）并使其下次发动主动战法后，对敌军单体造成谋略伤害（伤害率102%，受智力影响）	loại bỏ nhóm địch (1-2) người增益trạng thái, tăng toàn bộ quân ta 1 lượt6%chiến pháp chủ độngphát động率 (chịu trí lực ảnh hưởng), và khiến 其lần sauphát độngchiến pháp chủ động后, đối với đơn thể địch gây sát thương mưu lược (tỉ lệ sát thương 102%, chịu trí lực ảnh hưởng)	敌军群体（1-2人）	nhóm địch (1-2 người)	{cavalry,shield,archer,spear,siege}	{荀攸}	{荀攸}	innate	\N	\N	\N	2026-01-16 01:51:50.828	2026-01-16 01:51:50.828	needs_update
35	\N	十胜十败	Thập Thắng Thập Bại	command	command	Chỉ huy	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E5%8D%81%E8%83%9C%E5%8D%81%E8%B4%A5	战斗前2回合，使我军主将获得洞察（免疫所有控制效果）状态，受到的伤害降低50%	战斗前2 lượt, khiến quân ta 主将nhận được thấu thị (miễn dịch 所có 控制hiệu quả) trạng thái, chịu sát thươnggiảm 50%	友军主将	đồng minh 主将	{cavalry,shield,archer,spear,siege}	{郭嘉}	{郭嘉}	innate	\N	\N	\N	2026-01-16 01:51:50.83	2026-01-16 01:51:50.83	needs_update
36	\N	十面埋伏	Thập 面 埋 伏	active	active	Chủ động	S	35	innate	https://wiki.biligame.com/sgzzlb/%E5%8D%81%E9%9D%A2%E5%9F%8B%E4%BC%8F	对有负面状态的敌军造成谋略攻击（伤害率96%，受智力影响），随后对敌军群体（2人）施加禁疗（无法恢复兵力）及叛逃状态，每回合持续造成伤害（伤害率74%，受武力或智力最高一项影响，无视防御），持续2回合	đối với có 负面trạng thái địch gây sát thương mưu lược (tỉ lệ sát thương 96%, chịu trí lực ảnh hưởng), 随后đối với nhóm địch (2 người)施加cấm hồi máu (không thể hồi phụcbinh lực) và phản bộitrạng thái, mỗi lượt kéo dài gây sát thương (tỉ lệ sát thương 74%, chịu vũ lực hoặc trí lực nhất 高一项 ảnh hưởng, bỏ qua phòng ngự), kéo dài 2 lượt	敌军群体（2人）	Nhóm địch (2 người)	{cavalry,shield,archer,spear,siege}	{程昱,孙坚}	{程昱}	innate	\N	\N	\N	2026-01-16 01:51:50.831	2026-01-16 01:51:50.831	needs_update
176	\N	鸱苕英姿	[鸱] [苕] Anh [姿]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{马云禄}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.995	2026-01-16 01:51:50.995	needs_update
37	\N	南蛮渠魁	Nam Man Cừ Khôi	command	command	Chỉ huy	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E5%8D%97%E8%9B%AE%E6%B8%A0%E9%AD%81	战斗中，每回合行动时有49%几率对敌军全体造成兵刃伤害（伤害率106%），若未生效则提高7%发动概率，自身受到7次普通攻击后会进入1回合震慑（无法行动）状态；自身为主将时，每回合有15%（部队每多1名蛮族武将额外提高15%）概率使全体蛮族造成的伤害提高15%（受自身损失兵力影响，最多80%），持续1回合	战斗中, mỗi lượt行动 khi có 49%xác suấtđối với toàn bộ địch gây sát thương vật lý (tỉ lệ sát thương 106%), nếu 未có hiệu lực thì tăng 7%phát động xác suất, bản thân chịu 7 lần普通tấn công后会rơi vào 1 lượtchấn nhiếp (không thể 行动) trạng thái; bản thân là 主将 khi, mỗi lượtcó 15% (部队mỗi 多1名蛮族võ tướngthêm tăng 15%) xác suất khiến toàn bộ 蛮族gây sát thươngtăng 15% (chịu bản thân 损失binh lực ảnh hưởng, tối đa 80%), kéo dài 1 lượt	敌军全体	Toàn bộ địch	{cavalry,shield,archer,spear,siege}	{孟获}	{孟获}	innate	\N	\N	\N	2026-01-16 01:51:50.832	2026-01-16 01:51:50.832	needs_update
38	\N	卧薪尝胆	[卧] [薪] [尝] [胆]	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{孙权}	inheritance	\N	\N	\N	2026-01-16 01:51:50.834	2026-01-16 01:51:50.834	needs_update
39	\N	古之恶来	Cổ Chi Ác Lai	command	command	Chỉ huy	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E5%8F%A4%E4%B9%8B%E6%81%B6%E6%9D%A5	我军主将即将受到普通攻击时,自身会对攻击者进行一次猛击(伤害率80%)并使其造成兵刃伤害降低18%，持续1回合,随后为我军主将承担此次普通攻击。	quân ta 主将即将chịu 普通tấn công khi,bản thân 会đối với tấn công者进行一 lần猛击(tỉ lệ sát thương 80%), và khiến 其gây sát thương vật lýgiảm 18%, kéo dài 1 lượt,随后là quân ta 主将承担此 lần普通tấn công.	我军主将	quân ta 主将	{cavalry,shield,archer,spear,siege}	{典韦}	{典韦}	innate	\N	\N	\N	2026-01-16 01:51:50.836	2026-01-16 01:51:50.836	needs_update
41	\N	四面楚歌	四 面 楚 歌	active	active	Chủ động	S	50	inherited	https://wiki.biligame.com/sgzzlb/%E5%9B%9B%E9%9D%A2%E6%A5%9A%E6%AD%8C	准备1回合，对敌军群体（2人）施加中毒状态，每回合持续造成伤害（伤害率144%，受智力影响），持续2回合	chuẩn bị 1 lượt, đối với nhóm địch (2 người)施加trạng thái trúng độc, mỗi lượt kéo dài gây sát thương (tỉ lệ sát thương 144%, chịu trí lực ảnh hưởng), kéo dài 2 lượt	敌军群体（2人）	Nhóm địch (2 người)	{cavalry,shield,archer,spear,siege}	{}	{荀彧,李儒}	inheritance	\N	\N	\N	2026-01-16 01:51:50.838	2026-01-16 01:51:50.838	needs_update
42	\N	围师必阙	[围] Sư [必] [阙]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{sp朱儁}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.84	2026-01-16 01:51:50.84	needs_update
43	\N	固若金汤	Cố 若 金 汤	active	active	Chủ động	S	45	innate	https://wiki.biligame.com/sgzzlb/%E5%9B%BA%E8%8B%A5%E9%87%91%E6%B1%A4	使自己获得洞察（免疫所有控制效果）状态并嘲讽（强迫目标普通攻击自己）敌军全体，同时提高自身150统率，持续2回合	khiến bản thân nhận được thấu thị (miễn dịch 所có 控制hiệu quả) trạng thái, và khiêu khích (强迫mục tiêu普通tấn côngbản thân ) toàn bộ địch, đồng thờităng bản thân 150thống suất, kéo dài 2 lượt	自己	bản thân	{cavalry,shield,archer,spear,siege}	{曹仁}	{曹仁}	innate	\N	\N	\N	2026-01-16 01:51:50.841	2026-01-16 01:51:50.841	needs_update
44	\N	国士将风	Quốc Sĩ Tướng [风]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{凌统}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.843	2026-01-16 01:51:50.843	needs_update
45	\N	国色	Quốc Sắc	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{大乔}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.844	2026-01-16 01:51:50.844	needs_update
46	\N	坐断东南	Tọa [断] Đông Nam	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{孙权}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.845	2026-01-16 01:51:50.845	needs_update
47	\N	垂心万物	垂 心 Vạn 物	command	command	Chỉ huy	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E5%9E%82%E5%BF%83%E4%B8%87%E7%89%A9	战斗中，奇数回合有70%概率（受智力影响）使我军武力最高的武将造成兵刃伤害提高20%（受智力影响，持续到其行动前），若目标不处于连击状态则令其尝试对敌军单体发动一次普通攻击，否则自身对敌军单体造成谋略伤害（伤害率188%，受智力影响），偶数回合有70%概率（受智力影响）恢复我军群体（2人）兵力（治疗率86%，受智力影响）	战斗中, 奇数 lượt có 70% xác suất (chịu trí lực ảnh hưởng) khiến quân ta vũ lực nhất 高 võ tướnggây sát thương vật lýtăng 20% (chịu trí lực ảnh hưởng, kéo dài đến 其行动前), nếu mục tiêukhông 处于liên kíchtrạng thái thì 令其尝试đối với đơn thể địch phát động一 lần普通tấn công, 否 thì bản thân đối với đơn thể địch gây sát thương mưu lược (tỉ lệ sát thương 188%, chịu trí lực ảnh hưởng), 偶数 lượt có 70% xác suất (chịu trí lực ảnh hưởng) hồi phụcnhóm quân ta (2 người) binh lực (hồi phục率86%, chịu trí lực ảnh hưởng)	友军单体	Đơn thể đồng minh	{cavalry,shield,archer,spear,siege}	{王元姬}	{王元姬}	innate	\N	\N	\N	2026-01-16 01:51:50.846	2026-01-16 01:51:50.846	needs_update
48	\N	士争先赴	Sĩ [争] Tiên [赴]	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{张苞,关兴}	inheritance	\N	\N	\N	2026-01-16 01:51:50.847	2026-01-16 01:51:50.847	needs_update
49	\N	士别三日	Sĩ [别] Tam Nhật	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{吕蒙}	inheritance	\N	\N	\N	2026-01-16 01:51:50.849	2026-01-16 01:51:50.849	needs_update
50	\N	处兹不惑	[处] [兹] [不] [惑]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{徐庶}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.85	2026-01-16 01:51:50.85	needs_update
51	\N	大戟士	Đại Kích Sĩ	troop	troop	Binh chủng	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E5%A4%A7%E6%88%9F%E5%A3%AB	将枪兵进阶为横冲直撞的大戟士：我军全体武力提高14点，进行普通攻击时，有35%几率对敌军单体造成兵刃伤害（伤害率122%）；若张郃统领，则发动几率提高为40%	将thương binh进阶là 横冲直撞 大戟士: toàn bộ quân ta vũ lựctăng 14 điểm, 进行普通tấn công khi, có 35%xác suấtđối với đơn thể địch gây sát thương vật lý (tỉ lệ sát thương 122%); nếu 张郃统领, thì phát độngxác suấttăng là 40%	我军全体	Toàn bộ quân ta	{spear}	{张郃}	{张郃}	innate	\N	\N	\N	2026-01-16 01:51:50.851	2026-01-16 01:51:50.851	needs_update
53	\N	天香	Thiên Hương	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{小乔}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.854	2026-01-16 01:51:50.854	needs_update
54	\N	夺魂挟魄	[夺] Hồn [挟] Phách	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{小乔,蔡文姬}	inheritance	\N	\N	\N	2026-01-16 01:51:50.856	2026-01-16 01:51:50.856	needs_update
55	\N	奇兵间道	[奇] Binh [间] Đạo	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{魏延}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.857	2026-01-16 01:51:50.857	needs_update
56	\N	奇施经略	[奇] [施] [经] [略]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{张纮}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.858	2026-01-16 01:51:50.858	needs_update
57	\N	奇计良谋	[奇] Kế Lương Mưu	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{蒋琬,鲁肃}	inheritance	\N	\N	\N	2026-01-16 01:51:50.86	2026-01-16 01:51:50.86	needs_update
58	\N	奋矛英姿	Phấn Mâu Anh [姿]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{张姬}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.861	2026-01-16 01:51:50.861	needs_update
59	\N	威谋靡亢	Uy Mưu [靡] [亢]	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{魏延,沮授}	inheritance	\N	\N	\N	2026-01-16 01:51:50.861	2026-01-16 01:51:50.861	needs_update
60	\N	威震华夏	Uy Chấn Hoa Hạ	active	active	Chủ động	S	35	innate	https://wiki.biligame.com/sgzzlb/%E5%A8%81%E9%9C%87%E5%8D%8E%E5%A4%8F	准备1回合，对敌军全体进行猛攻（伤害率146%），使其有50%概率进入缴械（无法进行普通攻击）、计穷（无法发动主动战法）状态，独立判定，持续1回合，并使自己造成的兵刃伤害提升36%，持续2回合；自身为主将时，造成控制效果的概率提高65%	chuẩn bị 1 lượt, đối với toàn bộ địch 进行猛攻 (tỉ lệ sát thương 146%), khiến 其có 50% xác suất rơi vào tước vũ khí (không thể 进行普通tấn công)、kế cùng (không thể phát độngchiến pháp chủ động) trạng thái, 独立判定, kéo dài 1 lượt, và khiến bản thân gây sát thương vật lýtăng 36%, kéo dài 2 lượt; bản thân là 主将 khi, gây 控制hiệu quả xác suất tăng 65%	敌军群体	Nhóm địch	{cavalry,shield,archer,spear,siege}	{关羽}	{关羽}	innate	\N	\N	\N	2026-01-16 01:51:50.863	2026-01-16 01:51:50.863	needs_update
61	\N	守而必固	Thủ Nhi Tất Cố	command	command	Chỉ huy	S	\N	inherited	https://wiki.biligame.com/sgzzlb/%E5%AE%88%E8%80%8C%E5%BF%85%E5%9B%BA	战斗开始时，嘲讽敌军主将（强迫目标普通攻击自己），并使自己的统率提升40点，持续4回合	战斗bắt đầu khi, khiêu khíchđịch 主将 (强迫mục tiêu普通tấn côngbản thân ), và khiến bản thân thống suấttăng 40 điểm, kéo dài 4 lượt	敌军主将	địch 主将	{cavalry,shield,archer,spear,siege}	{}	{曹植,程昱}	inheritance	\N	\N	\N	2026-01-16 01:51:50.864	2026-01-16 01:51:50.864	needs_update
62	\N	定谋贵决	Định Mưu 贵 Quyết	active	active	Chủ động	S	40	inherited	https://wiki.biligame.com/sgzzlb/%E5%AE%9A%E8%B0%8B%E8%B4%B5%E5%86%B3	使敌军兵力最高单体嘲讽我军全体，并使其受到伤害提高20%，持续1回合	khiến địch binh lực nhất 高đơn thể khiêu khíchtoàn bộ quân ta, và khiến 其chịu sát thươngtăng 20%, kéo dài 1 lượt	敌军单体	Đơn thể địch	{cavalry,shield,archer,spear,siege}	{}	{许攸}	inheritance	\N	\N	\N	2026-01-16 01:51:50.865	2026-01-16 01:51:50.865	needs_update
63	\N	将行其疾	Tướng Hành Kỳ Tật	assault	assault	Đột kích	S	60	innate	https://wiki.biligame.com/sgzzlb/%E5%B0%86%E8%A1%8C%E5%85%B6%E7%96%BE	普通攻击之后，对随机敌军单体发动一次兵刃攻击（伤害率158%）；若命中敌军主将，则使其进入计穷（无法发动主动战法）状态，持续2回合	普通tấn công, sau đó, đối với ngẫu nhiên đơn thể địch phát động一 lầnsát thương vật lý (tỉ lệ sát thương 158%); nếu 命中địch 主将, thì khiến 其rơi vào kế cùng (không thể phát độngchiến pháp chủ động) trạng thái, kéo dài 2 lượt	敌军单体	Đơn thể địch	{cavalry,shield,archer,spear,siege}	{夏侯渊}	{夏侯渊}	innate	\N	\N	\N	2026-01-16 01:51:50.866	2026-01-16 01:51:50.866	needs_update
64	\N	将门虎女	Tướng Môn Hổ Nữ	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{关银屏}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.868	2026-01-16 01:51:50.868	needs_update
65	\N	工神	[工] Thần	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{黄月英}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.869	2026-01-16 01:51:50.869	needs_update
66	\N	弓腰姬	Cung [腰] Cơ	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{孙尚香}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.87	2026-01-16 01:51:50.87	needs_update
67	\N	形机军略	Hình Cơ Quân [略]	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{姜维,袁术}	inheritance	\N	\N	\N	2026-01-16 01:51:50.871	2026-01-16 01:51:50.871	needs_update
68	\N	忠勇义烈	Trung Dũng Nghĩa Liệt	passive	passive	Bị động	S	\N	inherited	https://wiki.biligame.com/sgzzlb/%E5%BF%A0%E5%8B%87%E4%B9%89%E7%83%88	战斗中，自身每回合有60%概率获得以下效果：主动战法发动率提升6%（受武力影响）；武力、统帅、智力提升45%；28%倒戈，持续1回合，每种效果独立判定	战斗中, bản thân mỗi lượtcó 60% xác suất nhận được 以下hiệu quả: chiến pháp chủ độngphát động率tăng 6% (chịu vũ lực ảnh hưởng); vũ lực、统帅、trí lựctăng 45%; 28%倒戈, kéo dài 1 lượt, mỗi 种hiệu quả独立判定	自己	bản thân	{cavalry,shield,archer,spear,siege}	{}	{sp庞德,sp关羽}	inheritance	\N	\N	\N	2026-01-16 01:51:50.872	2026-01-16 01:51:50.872	needs_update
69	\N	戮力上国	戮 力 上 国	internal	internal	Nội chính	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E6%88%AE%E5%8A%9B%E4%B8%8A%E5%9B%BD	委任为主政官时，城建设施升级时间降低30%	bổ nhiệmlà 主政官 khi, 城建设施升级 khi 间giảm 30%	\N	\N	{}	{曹丕}	{曹丕}	innate	\N	\N	\N	2026-01-16 01:51:50.873	2026-01-16 01:51:50.873	needs_update
71	\N	才辩机捷	Tài Biện Cơ Tiệp	passive	passive	Bị động	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E6%89%8D%E8%BE%A9%E6%9C%BA%E6%8D%B7	使自身施加的灼烧、水攻、中毒、溃逃、沙暴、叛逃状态伤害提高90%，休整和急救的恢复量提高30%	khiến bản thân 施加 灼烧、水攻、trúng độc、hoảng loạn、bão cát、phản bộitrạng tháisát thươngtăng 90%, nghỉ ngơi和急救 hồi phục量tăng 30%	自己	bản thân	{cavalry,shield,archer,spear,siege}	{伊籍}	{伊籍}	innate	\N	\N	\N	2026-01-16 01:51:50.876	2026-01-16 01:51:50.876	needs_update
72	\N	折冲御侮	Chiết Xung Ngự Vũ	assault	assault	Đột kích	S	45	inherited	https://wiki.biligame.com/sgzzlb/%E6%8A%98%E5%86%B2%E5%BE%A1%E4%BE%AE	普通攻击之后，使随机敌军单体降低100点统率和智力，持续2回合；若自己不是主将，则额外使我军主将获得2次抵御，可免疫伤害，持续2回合。	普通tấn công, sau đó, khiến ngẫu nhiên đơn thể địch giảm 100 điểmthống suất和trí lực, kéo dài 2 lượt; nếu bản thân không 是主将, thì thêm khiến quân ta 主将nhận được 2 lần抵御, có thể miễn dịch sát thương, kéo dài 2 lượt.	敌军单体	Đơn thể địch	{cavalry,shield,archer,spear,siege}	{}	{典韦,太史慈}	inheritance	\N	\N	\N	2026-01-16 01:51:50.877	2026-01-16 01:51:50.877	needs_update
73	\N	抬棺决战	抬 棺 Quyết Chiến	active	active	Chủ động	S	30	innate	https://wiki.biligame.com/sgzzlb/%E6%8A%AC%E6%A3%BA%E5%86%B3%E6%88%98	准备1回合，移除敌军群体（2人）的增益效果，随后造成兵刃攻击（伤害率255%）	chuẩn bị 1 lượt, loại bỏ nhóm địch (2 người) 增益hiệu quả, 随后gây sát thương vật lý (tỉ lệ sát thương 255%)	敌军群体（2人）	Nhóm địch (2 người)	{cavalry,shield,archer,spear,siege}	{庞德}	{庞德}	innate	\N	\N	\N	2026-01-16 01:51:50.878	2026-01-16 01:51:50.878	needs_update
74	\N	持军毅重	持 Quân 毅 重	active	active	Chủ động	S	35	innate	https://wiki.biligame.com/sgzzlb/%E6%8C%81%E5%86%9B%E6%AF%85%E9%87%8D	使自己下次受到兵刃伤害提高40%，持续一回合，提高自身56点武力，持续3回合，并对敌军群体（2人）造成猛烈一击（伤害率184%）	khiến bản thân lần sauchịu sát thương vật lýtăng 40%, kéo dài 一 lượt, tăng bản thân 56 điểmvũ lực, kéo dài 3 lượt, và đối với nhóm địch (2 người) gây 猛烈一击 (tỉ lệ sát thương 184%)	自己及敌军群体（2人）	bản thân và nhóm địch (2 người)	{cavalry,shield,archer,spear,siege}	{于禁}	{于禁}	innate	\N	\N	\N	2026-01-16 01:51:50.879	2026-01-16 01:51:50.879	needs_update
75	\N	挫锐	Tỏa Nhuệ	command	command	Chỉ huy	S	\N	inherited	https://wiki.biligame.com/sgzzlb/%E6%8C%AB%E9%94%90	战斗前3回合，使敌军单体进入虚弱状态，造成伤害时有65%几率无法造成伤害	战斗前3 lượt, khiến đơn thể địch rơi vào trạng thái suy yếu, gây sát thương khi có 65%xác suấtkhông thể gây sát thương	敌军单体	Đơn thể địch	{cavalry,shield,archer,spear,siege}	{}	{孙坚,陈群}	inheritance	\N	\N	\N	2026-01-16 01:51:50.881	2026-01-16 01:51:50.881	needs_update
76	\N	振军击营	[振] Quân Kích [营]	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{高览}	inheritance	\N	\N	\N	2026-01-16 01:51:50.882	2026-01-16 01:51:50.882	needs_update
77	\N	搦战群雄	[搦] Chiến Quần Hùng	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{华雄}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.883	2026-01-16 01:51:50.883	needs_update
78	\N	文武双全	Văn Vũ Song Toàn	passive	passive	Bị động	S	\N	inherited	https://wiki.biligame.com/sgzzlb/%E6%96%87%E6%AD%A6%E5%8F%8C%E5%85%A8	战斗中，自己每次造成谋略伤害时，增加30点智力，最多叠加5次；每次造成兵刃伤害时，增加30点武力，最多叠加5次	战斗中, bản thân mỗi lầngây sát thương mưu lược khi, tăng thêm 30 điểmtrí lực, tối đa cộng dồn5 lần; mỗi lầngây sát thương vật lý khi, tăng thêm 30 điểmvũ lực, tối đa cộng dồn5 lần	自己	bản thân	{cavalry,shield,archer,spear,siege}	{}	{邓艾,钟会}	inheritance	\N	\N	\N	2026-01-16 01:51:50.884	2026-01-16 01:51:50.884	needs_update
79	\N	无当飞军	Vô Đương Phi Quân	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{王平}	{王平}	innate	\N	\N	\N	2026-01-16 01:51:50.885	2026-01-16 01:51:50.885	needs_update
80	\N	晓知良木	[晓] [知] Lương Mộc	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{蔡邕}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.886	2026-01-16 01:51:50.886	needs_update
81	\N	智计	Trí Kế	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{张纮,陈宫}	inheritance	\N	\N	\N	2026-01-16 01:51:50.887	2026-01-16 01:51:50.887	needs_update
82	\N	暂避其锋	暂 避 Kỳ Phong	command	command	Chỉ huy	S	\N	inherited	https://wiki.biligame.com/sgzzlb/%E6%9A%82%E9%81%BF%E5%85%B6%E9%94%8B	战斗开始后前3回合， 使我军智力最高的武将受到兵刃伤害降低40%（受智力影响），使我军武力最高的武将受到的谋略伤害降低40%（受智力影响）	战斗bắt đầu后前3 lượt, khiến quân ta trí lực nhất 高 võ tướngchịu sát thương vật lýgiảm 40% (chịu trí lực ảnh hưởng), khiến quân ta vũ lực nhất 高 võ tướngchịu sát thương mưu lượcgiảm 40% (chịu trí lực ảnh hưởng)	敌军群体（2人）	Nhóm địch (2 người)	{cavalry,shield,archer,spear,siege}	{}	{庞德,徐庶}	inheritance	\N	\N	\N	2026-01-16 01:51:50.888	2026-01-16 01:51:50.888	needs_update
83	\N	暗度陈仓	Ám 度 陈 仓	active	active	Chủ động	S	50	innate	https://wiki.biligame.com/sgzzlb/%E6%9A%97%E5%BA%A6%E9%99%88%E4%BB%93	准备1回合，对敌军单体造成谋略攻击（伤害率260%，受智力影响）并使其进入震慑状态（无法行动），持续2回合	chuẩn bị 1 lượt, đối với đơn thể địch gây sát thương mưu lược (tỉ lệ sát thương 260%, chịu trí lực ảnh hưởng), và khiến 其rơi vào chấn nhiếptrạng thái (không thể 行动), kéo dài 2 lượt	敌军单体	Đơn thể địch	{cavalry,shield,archer,spear,siege}	{邓艾}	{邓艾}	innate	\N	\N	\N	2026-01-16 01:51:50.89	2026-01-16 01:51:50.89	needs_update
84	\N	暗箭难防	Ám [箭] Nan Phòng	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{马忠}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.891	2026-01-16 01:51:50.891	needs_update
85	\N	暴戾无仁	[暴] [戾] Vô Nhân	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{董卓}	inheritance	\N	\N	\N	2026-01-16 01:51:50.893	2026-01-16 01:51:50.893	needs_update
86	\N	机鉴先识	Cơ Giám Tiên Thức	command	command	Chỉ huy	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E6%9C%BA%E9%89%B4%E5%85%88%E8%AF%86	准备回合使我军群体(2-3人)获得2次警戒,随后每回合有42%概率(受智力影响)使我军群体(2-3人)获得1次警戒(持续3回合,可重复获得4次):受到的伤害超过自身可携带最大兵力的6%时(最低100兵力),使该次伤害降低40%(受智力影响)并消耗一次警戒;自身为主将时,战斗前2回合,使我军全体受到缴械、计穷、混乱、震慑状态时,有75%概率同时施加给敌军单体,每回合每人最多生效一次	chuẩn bị lượt khiến nhóm quân ta (2-3 người) nhận được 2 lần警戒,随后mỗi lượtcó 42% xác suất (chịu trí lực ảnh hưởng) khiến nhóm quân ta (2-3 người) nhận được 1 lần警戒( kéo dài 3 lượt,có thể 重复nhận được 4 lần):chịu sát thương超过bản thân có thể 携带 nhất 大binh lực 6% khi ( nhất 低100binh lực),khiến 该 lầnsát thươnggiảm 40%(chịu trí lực ảnh hưởng), và 消耗一 lần警戒;bản thân là 主将 khi,战斗前2 lượt,khiến toàn bộ quân ta chịu tước vũ khí、kế cùng、hỗn loạn、chấn nhiếptrạng thái khi,có 75% xác suất đồng thời施加 cho đơn thể địch,mỗi lượtmỗi ngườitối đa có hiệu lực一 lần	我军群体（2-3人）	nhóm quân ta (2-3 người)	{cavalry,shield,archer,spear,siege}	{sp荀彧}	{sp荀彧}	innate	\N	\N	\N	2026-01-16 01:51:50.894	2026-01-16 01:51:50.894	needs_update
87	\N	杯蛇鬼车	杯 蛇 鬼 车	active	active	Chủ động	S	50	inherited	https://wiki.biligame.com/sgzzlb/%E6%9D%AF%E8%9B%87%E9%AC%BC%E8%BD%A6	准备1回合，对敌军群体（2人）发动一次谋略攻击（伤害率153%），并为我军群体（2人）恢复一定兵力（回复率102%，受智力影响）	chuẩn bị 1 lượt, đối với nhóm địch (2 người) phát động一 lầnsát thương mưu lược (tỉ lệ sát thương 153%), và là nhóm quân ta (2 người) hồi phục一定binh lực (回复率102%, chịu trí lực ảnh hưởng)	敌军群和我军群体	địch 群和nhóm quân ta	{cavalry,shield,archer,spear,siege}	{}	{于吉,左慈}	inheritance	\N	\N	\N	2026-01-16 01:51:50.895	2026-01-16 01:51:50.895	needs_update
88	\N	枪舞如风	Thương Vũ [如] [风]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{张苞}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.897	2026-01-16 01:51:50.897	needs_update
89	\N	校胜帷幄	[校] Thắng Vi [幄]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{陆抗}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.898	2026-01-16 01:51:50.898	needs_update
90	\N	梦中弑臣	Mộng Trung Thí Thần	command	command	Chỉ huy	S	\N	inherited	https://wiki.biligame.com/sgzzlb/%E6%A2%A6%E4%B8%AD%E5%BC%91%E8%87%A3	战斗前2回合，如果自己为主将，则使随机副将为自己分担40%伤害。战斗第3回合起，自己行动时如果有负面状态，则获得50%概率反击状态(伤害率150%)，直到战斗结束	战斗前2 lượt, nếu bản thân là 主将, thì khiến ngẫu nhiên 副将là bản thân 分担40%sát thương. 战斗第3 lượt起, bản thân 行动 khi nếu có 负面trạng thái, thì nhận được 50% xác suất phản kíchtrạng thái(tỉ lệ sát thương 150%), 直 đến 战斗kết thúc	自己	bản thân	{cavalry,shield,archer,spear,siege}	{}	{曹操}	inheritance	\N	\N	\N	2026-01-16 01:51:50.899	2026-01-16 01:51:50.899	needs_update
91	\N	槊血纵横	Sóc Huyết Túng Hoành	passive	passive	Bị động	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E6%A7%8A%E8%A1%80%E7%BA%B5%E6%A8%AA	战斗中，使自己获得34点武力及54%群攻（普通攻击时对目标同部队其他武将造成伤害）效果，自身为主将时，群攻值为60%	战斗中, khiến bản thân nhận được 34 điểmvũ lực và 54%群攻 (普通tấn công khi đối với mục tiêu同部队其他võ tướnggây sát thương) hiệu quả, bản thân là 主将 khi, 群攻值là 60%	自己	bản thân	{cavalry,shield,spear,siege}	{马超}	{马超}	innate	\N	\N	\N	2026-01-16 01:51:50.9	2026-01-16 01:51:50.9	needs_update
92	\N	横戈跃马	Hoành 戈 跃 马	command	command	Chỉ huy	S	\N	inherited	https://wiki.biligame.com/sgzzlb/%E6%A8%AA%E6%88%88%E8%B7%83%E9%A9%AC	战斗前3回合，使双方全体造成的谋略伤害降低30%；第三回合起，使我军全体造成的兵刃伤害提升20%（受速度影响），持续到战斗结束	战斗前3 lượt, khiến 双方toàn bộ gây sát thương mưu lượcgiảm 30%; 第三 lượt 起, khiến toàn bộ quân ta gây sát thương vật lýtăng 20% (chịu tốc độ ảnh hưởng), kéo dài đến 战斗kết thúc	双方全体	双方toàn bộ	{cavalry,shield,archer,spear,siege}	{}	{郝昭,凌统}	inheritance	\N	\N	\N	2026-01-16 01:51:50.901	2026-01-16 01:51:50.901	needs_update
94	\N	死战不退	Tử Chiến Bất Thoái	passive	passive	Bị động	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E6%AD%BB%E6%88%98%E4%B8%8D%E9%80%80	战斗中，使自己免疫混乱；自身受到伤害时，有80%概率获得一层蓄威效果，可积攒20层；普攻后，有50%概率（受武力影响）消耗一层蓄威对敌军单体造成一次兵刃伤害（伤害率130%），触发后可继续判定，每次触发后几率降低8%，每次普攻后最多触发5次	战斗中, khiến bản thân miễn dịch hỗn loạn; bản thân chịu sát thương khi, có 80% xác suất nhận được 一 tầng蓄威hiệu quả, có thể 积攒20 tầng; 普攻后, có 50% xác suất (chịu vũ lực ảnh hưởng)消耗一 tầng蓄威đối với đơn thể địch gây 一 lầnsát thương vật lý (tỉ lệ sát thương 130%), kích hoạt后có thể 继续判定, mỗi lầnkích hoạt后xác suấtgiảm 8%, mỗi lần普攻后tối đa kích hoạt5 lần	自己	bản thân	{cavalry,shield,archer,spear,siege}	{sp庞德}	{sp庞德}	innate	\N	\N	\N	2026-01-16 01:51:50.903	2026-01-16 01:51:50.903	needs_update
95	\N	毒泉拒蜀	Độc Tuyền [拒] Thục	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{朵思大王}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.905	2026-01-16 01:51:50.905	needs_update
96	\N	水淹七军	Thủy 淹 七 Quân	active	active	Chủ động	S	50	innate	https://wiki.biligame.com/sgzzlb/%E6%B0%B4%E6%B7%B9%E4%B8%83%E5%86%9B	对敌军群体（2人）施加水攻状态（伤害率96%，受武力影响，自身为主将时，伤害率提升至108%），持续2回合；第二次及之后施放前，使敌军群体（2-3人）受到兵刃伤害提升20%（受武力影响），持续1回合；第三次及之后施放时，有40%概率（受武力影响）立即结算敌军全体的水攻状态（不清除状态）；第四次施放后，对有水攻状态的敌军造成兵刃伤害（伤害率208%）	đối với nhóm địch (2 người)施加水攻trạng thái (tỉ lệ sát thương 96%, chịu vũ lực ảnh hưởng, bản thân là 主将 khi, tỉ lệ sát thương tăng 至108%), kéo dài 2 lượt; 第二 lần và, sau đó 施放前, khiến nhóm địch (2-3 người) chịu sát thương vật lýtăng 20% (chịu vũ lực ảnh hưởng), kéo dài 1 lượt; 第三 lần và, sau đó 施放 khi, có 40% xác suất (chịu vũ lực ảnh hưởng) ngay lập tức结算toàn bộ địch 水攻trạng thái (không xóa bỏ trạng thái); 第四 lần施放后, đối với có 水攻trạng thái địch gây sát thương vật lý (tỉ lệ sát thương 208%)	敌军群体（2人）	Nhóm địch (2 người)	{cavalry,shield,archer,spear,siege}	{sp关羽}	{sp关羽}	innate	\N	\N	\N	2026-01-16 01:51:50.906	2026-01-16 01:51:50.906	needs_update
97	\N	水镜先生	Thủy Kính Tiên Sinh	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{司马徵}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.907	2026-01-16 01:51:50.907	needs_update
98	\N	江东小霸王	Giang Đông Tiểu Bá Vương	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{孙策}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.909	2026-01-16 01:51:50.909	needs_update
99	\N	江天长焰	Giang Thiên Trường Diễm	command	command	Chỉ huy	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E6%B1%9F%E5%A4%A9%E9%95%BF%E7%84%B0	战斗中，每回合使敌军全体受到谋略伤害提高4%（受智力影响），可叠加，并有几率（25%，没有一名敌军处于灼烧或水攻状态时，提高4%）对敌军单体造成谋略伤害（伤害率146%，受智力影响）；自身为主将时，基础概率提高至35%且该次攻击目标将锁定敌军兵力最低单体	战斗中, mỗi lượtkhiến toàn bộ địch chịu sát thương mưu lượctăng 4% (chịu trí lực ảnh hưởng), có thể cộng dồn, và có xác suất (25%, 没có 一名địch 处于灼烧 hoặc 水攻trạng thái khi, tăng 4%) đối với đơn thể địch gây sát thương mưu lược (tỉ lệ sát thương 146%, chịu trí lực ảnh hưởng); bản thân là 主将 khi, 基础 xác suất tăng 至35%且该 lầntấn côngmục tiêu将锁定địch binh lực nhất 低đơn thể	敌军全体负面，敌军单体伤害	toàn bộ địch 负面, đơn thể địch sát thương	{cavalry,shield,archer,spear,siege}	{sp周瑜}	{sp周瑜}	innate	\N	\N	\N	2026-01-16 01:51:50.91	2026-01-16 01:51:50.91	needs_update
100	\N	沉断机谋	Trầm Đoạn Cơ Mưu	active	active	Chủ động	S	40	innate	https://wiki.biligame.com/sgzzlb/%E6%B2%89%E6%96%AD%E6%9C%BA%E8%B0%8B	使敌军群体（2人）统率、智力降低30%， 持续2回合，并造成谋略伤害（伤害率156%，受智力影响）	khiến nhóm địch (2 người) thống suất、trí lựcgiảm 30%, kéo dài 2 lượt, và gây sát thương mưu lược (tỉ lệ sát thương 156%, chịu trí lực ảnh hưởng)	敌军群体（2人）	Nhóm địch (2 người)	{cavalry,shield,archer,spear,siege}	{张春华}	{张春华}	innate	\N	\N	\N	2026-01-16 01:51:50.911	2026-01-16 01:51:50.911	needs_update
101	\N	沉沙决水	Trầm Sa Quyết Thủy	active	active	Chủ động	S	40	inherited	https://wiki.biligame.com/sgzzlb/%E6%B2%89%E6%B2%99%E5%86%B3%E6%B0%B4	准备1回合，对敌军群体（2人）施加水攻状态，每回合持续造成伤害（伤害率126%，受智力影响），并使其受到的谋略伤害提升25%，持续2回合	chuẩn bị 1 lượt, đối với nhóm địch (2 người)施加水攻trạng thái, mỗi lượt kéo dài gây sát thương (tỉ lệ sát thương 126%, chịu trí lực ảnh hưởng), và khiến 其chịu sát thương mưu lượctăng 25%, kéo dài 2 lượt	敌军群体（2人）	Nhóm địch (2 người)	{cavalry,shield,archer,spear,siege}	{}	{郭嘉,法正}	inheritance	\N	\N	\N	2026-01-16 01:51:50.912	2026-01-16 01:51:50.912	needs_update
102	\N	济贫好施	[济] [贫] Hảo [施]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{鲁肃}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.913	2026-01-16 01:51:50.913	needs_update
103	\N	清流雅望	清 Lưu 雅 望	internal	internal	Nội chính	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E6%B8%85%E6%B5%81%E9%9B%85%E6%9C%9B	武将委任为冶铁官时，铁矿产量提升3%	võ tướngbổ nhiệmlà 冶铁官 khi, 铁矿产量tăng 3%	\N	\N	{}	{陈群}	{陈群}	innate	\N	\N	\N	2026-01-16 01:51:50.915	2026-01-16 01:51:50.915	needs_update
104	\N	溯江摇橹	[溯] Giang [摇] [橹]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{sp吕蒙}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.916	2026-01-16 01:51:50.916	needs_update
105	\N	火烧连营	[火] [烧] [连] [营]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{陆逊}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.917	2026-01-16 01:51:50.917	needs_update
106	\N	火神英风	[火] Thần Anh [风]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{祝融夫人}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.918	2026-01-16 01:51:50.918	needs_update
107	\N	焰逐风飞	Diễm Trục Phong Phi	active	active	Chủ động	S	35	inherited	https://wiki.biligame.com/sgzzlb/%E7%84%B0%E9%80%90%E9%A3%8E%E9%A3%9E	对敌军单体造成谋略伤害（伤害率226%，受智力影响）及震慑状态（无法行动）并有40%概率使其受到谋略伤害提高12%（受智力影响），持续1回合	đối với đơn thể địch gây sát thương mưu lược (tỉ lệ sát thương 226%, chịu trí lực ảnh hưởng) và chấn nhiếptrạng thái (không thể 行动), và có 40% xác suất khiến 其chịu sát thương mưu lượctăng 12% (chịu trí lực ảnh hưởng), kéo dài 1 lượt	敌军单体	Đơn thể địch	{cavalry,shield,archer,spear,siege}	{}	{sp周瑜,sp诸葛亮}	inheritance	\N	\N	\N	2026-01-16 01:51:50.919	2026-01-16 01:51:50.919	needs_update
108	\N	熯天炽地	[熯] Thiên [炽] Địa	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{陆逊}	inheritance	\N	\N	\N	2026-01-16 01:51:50.92	2026-01-16 01:51:50.92	needs_update
109	\N	燕人咆哮	[燕] Nhân [咆] [哮]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{张飞}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.922	2026-01-16 01:51:50.922	needs_update
110	\N	狮子奋迅	[狮] Tử Phấn [迅]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{吕玲绮}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.923	2026-01-16 01:51:50.923	needs_update
111	\N	王佐之才	王 佐 Chi Tài	internal	internal	Nội chính	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E7%8E%8B%E4%BD%90%E4%B9%8B%E6%89%8D	提升武将72政治	tăng võ tướng72政治	\N	\N	{}	{荀彧}	{荀彧}	innate	\N	\N	\N	2026-01-16 01:51:50.925	2026-01-16 01:51:50.925	needs_update
112	\N	用武通神	Dụng Vũ Thông Thần	command	command	Chỉ huy	S	\N	inherited	https://wiki.biligame.com/sgzzlb/%E7%94%A8%E6%AD%A6%E9%80%9A%E7%A5%9E	战斗开始的第2、4、6、8回合，对敌军群体（2人）逐渐造成75%、105%、135%、165%谋略伤害（受智力影响）	战斗bắt đầu 第2、4、6、8 lượt, đối với nhóm địch (2 người)逐渐gây 75%、105%、135%、165%sát thương mưu lược (chịu trí lực ảnh hưởng)	敌军群体（2人）	Nhóm địch (2 người)	{cavalry,shield,archer,spear,siege}	{}	{司马懿}	inheritance	\N	\N	\N	2026-01-16 01:51:50.926	2026-01-16 01:51:50.926	needs_update
113	\N	登锋陷阵	[登] [锋] [陷] Trận	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{文丑}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.927	2026-01-16 01:51:50.927	needs_update
114	\N	白毦兵	Bạch [毦] Binh	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{陈到}	{陈到}	innate	\N	\N	\N	2026-01-16 01:51:50.928	2026-01-16 01:51:50.928	needs_update
115	\N	白衣渡江	Bạch [衣] [渡] Giang	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{吕蒙}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.929	2026-01-16 01:51:50.929	needs_update
116	\N	白马义从	Bạch Mã Nghĩa Tùng	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{公孙瓒}	{公孙瓒}	innate	\N	\N	\N	2026-01-16 01:51:50.93	2026-01-16 01:51:50.93	needs_update
117	\N	百步穿杨	Bách Bộ [穿] Dương	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{黄忠}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.931	2026-01-16 01:51:50.931	needs_update
118	\N	百计多谋	Bách Kế [多] Mưu	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{陈宫}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.933	2026-01-16 01:51:50.933	needs_update
119	\N	百骑劫营	Bách Kỵ [劫] [营]	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{甘宁}	inheritance	\N	\N	\N	2026-01-16 01:51:50.934	2026-01-16 01:51:50.934	needs_update
120	\N	益其金鼓	[益] [其] Kim [鼓]	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{sp吕蒙,董白}	inheritance	\N	\N	\N	2026-01-16 01:51:50.935	2026-01-16 01:51:50.935	needs_update
121	\N	监统震军	[监] Thống Chấn Quân	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{沮授}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.936	2026-01-16 01:51:50.936	needs_update
122	\N	盛气凌敌	盛 Khí 凌 Địch	command	command	Chỉ huy	S	\N	inherited	https://wiki.biligame.com/sgzzlb/%E7%9B%9B%E6%B0%94%E5%87%8C%E6%95%8C	战斗开始后前2回合，使敌军群体（2人）每回合都有90%的几率陷入缴械状态，无法进行普通攻击	战斗bắt đầu后前2 lượt, khiến nhóm địch (2 người) mỗi lượt đều có 90% xác suất陷入tước vũ khítrạng thái, không thể 进行普通tấn công	敌军群体（2人）	Nhóm địch (2 người)	{cavalry,shield,archer,spear,siege}	{}	{曹丕,颜良}	inheritance	\N	\N	\N	2026-01-16 01:51:50.937	2026-01-16 01:51:50.937	needs_update
123	\N	瞋目横矛	[瞋] Mục [横] Mâu	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{张飞}	inheritance	\N	\N	\N	2026-01-16 01:51:50.938	2026-01-16 01:51:50.938	needs_update
124	\N	破军威胜	Phá Quân Uy Thắng	active	active	Chủ động	S	40	inherited	https://wiki.biligame.com/sgzzlb/%E7%A0%B4%E5%86%9B%E5%A8%81%E8%83%9C	降低敌军单体70点统率（受武力影响），持续2回合，并对其造成兵刃伤害（伤害率228%）	giảm đơn thể địch 70 điểmthống suất (chịu vũ lực ảnh hưởng), kéo dài 2 lượt, và đối với 其gây sát thương vật lý (tỉ lệ sát thương 228%)	敌军单体	Đơn thể địch	{cavalry,shield,archer,spear,siege}	{}	{满宠,王双}	inheritance	\N	\N	\N	2026-01-16 01:51:50.939	2026-01-16 01:51:50.939	needs_update
125	\N	破阵催坚	Phá Trận [催] Kiên	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{文丑}	inheritance	\N	\N	\N	2026-01-16 01:51:50.94	2026-01-16 01:51:50.94	needs_update
126	\N	破阵摧坚	Phá Trận [摧] Kiên	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{孙策}	inheritance	\N	\N	\N	2026-01-16 01:51:50.941	2026-01-16 01:51:50.941	needs_update
127	\N	神射	Thần Xạ	passive	passive	Bị động	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E7%A5%9E%E5%B0%84	战斗中，使自己获得连击状态，每回合可以普通攻击2次，并使普通攻击目标统率降低25，可叠加，持续2回合	战斗中, khiến bản thân nhận được liên kíchtrạng thái, mỗi lượtcó thể 普通tấn công2 lần, và khiến 普通tấn côngmục tiêuthống suấtgiảm 25, có thể cộng dồn, kéo dài 2 lượt	自己	bản thân	{cavalry,shield,archer,spear,siege}	{太史慈}	{太史慈}	innate	\N	\N	\N	2026-01-16 01:51:50.942	2026-01-16 01:51:50.942	needs_update
128	\N	神机妙算	Thần Cơ Diệu Toán	command	command	Chỉ huy	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E7%A5%9E%E6%9C%BA%E5%A6%99%E7%AE%97	敌军群体（2人）发动主动战法时，有35%几率令其失败并对其造成谋略伤害（伤害率100%，受智力影响），自身为主将时，该次伤害会基于双方智力之差额外提高	nhóm địch (2 người) phát độngchiến pháp chủ động khi, có 35%xác suất令其失败, và đối với 其gây sát thương mưu lược (tỉ lệ sát thương 100%, chịu trí lực ảnh hưởng), bản thân là 主将 khi, 该 lầnsát thương会 dựa trên 双方trí lực之差thêm tăng	敌军群体（2人）	Nhóm địch (2 người)	{cavalry,shield,archer,spear,siege}	{诸葛亮}	{诸葛亮}	innate	\N	\N	\N	2026-01-16 01:51:50.943	2026-01-16 01:51:50.943	needs_update
129	\N	神机莫测	Thần Cơ Mạc Trắc	active	active	Chủ động	S	65	innate	https://wiki.biligame.com/sgzzlb/%E7%A5%9E%E6%9C%BA%E8%8E%AB%E6%B5%8B	使敌军单体混乱2回合，并对自身外的敌我全体依次判定：若未混乱则有35%概率使其混乱2回合；友军已混乱时，解除其负面状态（自身为主将时，提高其12%造成伤害，受智力影响，持续2回合）；敌军已混乱时，对其造成谋略攻击（伤害率175%，受智力影响）	khiến đơn thể địch hỗn loạn2 lượt, và đối với bản thân 外 敌我toàn bộ 依 lần判定: nếu 未hỗn loạn thì có 35% xác suất khiến 其hỗn loạn2 lượt; đồng minh 已hỗn loạn khi, 解除其负面trạng thái (bản thân là 主将 khi, tăng 其12%gây sát thương, chịu trí lực ảnh hưởng, kéo dài 2 lượt); địch 已hỗn loạn khi, đối với 其gây sát thương mưu lược (tỉ lệ sát thương 175%, chịu trí lực ảnh hưởng)	双方全体	双方toàn bộ	{cavalry,shield,archer,spear,siege}	{贾诩}	{贾诩}	innate	\N	\N	\N	2026-01-16 01:51:50.944	2026-01-16 01:51:50.944	needs_update
130	\N	神火计	Thần [火] Kế	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{周瑜}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.945	2026-01-16 01:51:50.945	needs_update
131	\N	窃幸乘宠	[窃] [幸] [乘] Sủng	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{张让}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.946	2026-01-16 01:51:50.946	needs_update
132	\N	竭力佐谋	竭 力 佐 Mưu	active	active	Chủ động	S	55	inherited	https://wiki.biligame.com/sgzzlb/%E7%AB%AD%E5%8A%9B%E4%BD%90%E8%B0%8B	使敌军智力最高单体智力降低20%,并有70%概率使自身本回合非自带主动战法发动率提高100%,持续1回合	khiến địch trí lực nhất 高đơn thể trí lựcgiảm 20%,, và có 70% xác suất khiến bản thân 本 lượt 非自带chiến pháp chủ độngphát động率tăng 100%, kéo dài 1 lượt	敌军单体及自身	đơn thể địch và bản thân	{cavalry,shield,archer,spear,siege}	{}	{sp荀彧,张让}	inheritance	\N	\N	\N	2026-01-16 01:51:50.947	2026-01-16 01:51:50.947	needs_update
133	\N	竭忠尽智	Kiệt Trung [尽] Trí	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{田丰}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.948	2026-01-16 01:51:50.948	needs_update
134	\N	符命自立	[符] [命] [自] Lập	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{袁术}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.949	2026-01-16 01:51:50.949	needs_update
135	\N	箕形阵	[箕] Hình Trận	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{关银屏,sp袁绍}	inheritance	\N	\N	\N	2026-01-16 01:51:50.95	2026-01-16 01:51:50.95	needs_update
136	\N	精练策数	Tinh 练 策 数	active	active	Chủ động	S	45	innate	https://wiki.biligame.com/sgzzlb/%E7%B2%BE%E7%BB%83%E7%AD%96%E6%95%B0	准备1回合，对敌军群体（2-3人）造成谋略攻击（伤害率210%，受智力影响），并缴械（无法进行普通攻击），持续2回合	chuẩn bị 1 lượt, đối với nhóm địch (2-3 người) gây sát thương mưu lược (tỉ lệ sát thương 210%, chịu trí lực ảnh hưởng), và tước vũ khí (không thể 进行普通tấn công), kéo dài 2 lượt	敌军群体（2-3人）	nhóm địch (2-3 người)	{cavalry,shield,archer,spear,siege}	{钟会}	{钟会}	innate	\N	\N	\N	2026-01-16 01:51:50.951	2026-01-16 01:51:50.951	needs_update
137	\N	累世立名	[累] Thế Lập Danh	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{袁绍}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.952	2026-01-16 01:51:50.952	needs_update
138	\N	经天纬地	经 Thiên 纬 Địa	command	command	Chỉ huy	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E7%BB%8F%E5%A4%A9%E7%BA%AC%E5%9C%B0	战斗中，我军全体发动主动战法及突击战法时，自身有70%概率（受智力影响）会对敌军全体发动谋略攻击（伤害率100%，受智力影响），若由自身触发，则额外有50%概率使我军群体（2人）获得10%攻心（造成谋略伤害时，恢复自身基于伤害量的一定兵力），持续2回合，可叠加3次攻心值；自身为主将时，攻心效果提高至20%	战斗中, toàn bộ quân ta phát độngchiến pháp chủ động và 突击chiến pháp khi, bản thân có 70% xác suất (chịu trí lực ảnh hưởng)会đối với toàn bộ địch phát độngsát thương mưu lược (tỉ lệ sát thương 100%, chịu trí lực ảnh hưởng), nếu 由bản thân kích hoạt, thì thêm có 50% xác suất khiến nhóm quân ta (2 người) nhận được 10%攻心 (gây sát thương mưu lược khi, hồi phụcbản thân dựa trên sát thương量 一定binh lực), kéo dài 2 lượt, có thể cộng dồn3 lần攻心值; bản thân là 主将 khi, 攻心hiệu quảtăng 至20%	我军全体及自己	toàn bộ quân ta và bản thân	{cavalry,shield,archer,spear,siege}	{sp郭嘉}	{sp郭嘉}	innate	\N	\N	\N	2026-01-16 01:51:50.953	2026-01-16 01:51:50.953	needs_update
139	\N	经术政要	[经] Thuật Chánh [要]	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{蔡邕}	inheritance	\N	\N	\N	2026-01-16 01:51:50.954	2026-01-16 01:51:50.954	needs_update
140	\N	结盟	[结] [盟]	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{孙尚香}	inheritance	\N	\N	\N	2026-01-16 01:51:50.956	2026-01-16 01:51:50.956	needs_update
141	\N	绝地反击	Tuyệt Địa Phản Kích	passive	passive	Bị động	S	\N	inherited	https://wiki.biligame.com/sgzzlb/%E7%BB%9D%E5%9C%B0%E5%8F%8D%E5%87%BB	战斗中，自己每次受到兵刃伤害后，武力提升6点，最大叠加10次；第5回合时，根据叠加次数对敌军全体造成兵刃伤害（伤害率120%，每次提高14%伤害率）	战斗中, bản thân mỗi lầnchịu sát thương vật lý后, vũ lựctăng 6 điểm, nhất 大cộng dồn10 lần; 第5 lượt khi, theo cộng dồn lần数đối với toàn bộ địch gây sát thương vật lý (tỉ lệ sát thương 120%, mỗi lầntăng 14%tỉ lệ sát thương )	敌军全体	Toàn bộ địch	{cavalry,shield,spear}	{}	{夏侯惇,吕玲绮}	inheritance	\N	\N	\N	2026-01-16 01:51:50.957	2026-01-16 01:51:50.957	needs_update
142	\N	肉身铁壁	Nhục Thân Thiết [壁]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{周泰}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.959	2026-01-16 01:51:50.959	needs_update
143	\N	胡笳余音	[胡] [笳] [余] Âm	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{蔡文姬}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.96	2026-01-16 01:51:50.96	needs_update
144	\N	舌战群儒	舌 Chiến 群 儒	command	command	Chỉ huy	S	\N	inherited	https://wiki.biligame.com/sgzzlb/%E8%88%8C%E6%88%98%E7%BE%A4%E5%84%92	敌军尝试发动主动战法时，有25%几率令其发动几率降低5%（受智力影响），并提高自己及随机友军主动战法4%（受智力影响）发动几率，持续1回合	địch 尝试phát độngchiến pháp chủ động khi, có 25%xác suất令其phát độngxác suấtgiảm 5% (chịu trí lực ảnh hưởng), và tăng bản thân và ngẫu nhiên đồng minh chiến pháp chủ động4% (chịu trí lực ảnh hưởng) phát độngxác suất, kéo dài 1 lượt	敌军全体	Toàn bộ địch	{cavalry,shield,archer,spear,siege}	{}	{诸葛亮}	inheritance	\N	\N	\N	2026-01-16 01:51:50.961	2026-01-16 01:51:50.961	needs_update
145	\N	花容月貌	花 容 月 貌	internal	internal	Nội chính	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E8%8A%B1%E5%AE%B9%E6%9C%88%E8%B2%8C	武将委任为练兵使时，练兵获得经验提升6%	võ tướngbổ nhiệmlà 练兵khiến khi, 练兵nhận được 经验tăng 6%	\N	\N	{}	{甄姬}	{甄姬}	innate	\N	\N	\N	2026-01-16 01:51:50.962	2026-01-16 01:51:50.962	needs_update
146	\N	苦肉计	Khổ Nhục Kế	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{黄盖}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.963	2026-01-16 01:51:50.963	needs_update
147	\N	藤甲兵	[藤] Giáp Binh	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{兀突骨}	{兀突骨}	innate	\N	\N	\N	2026-01-16 01:51:50.964	2026-01-16 01:51:50.964	needs_update
148	\N	虎痴	Hổ Si	passive	passive	Bị động	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E8%99%8E%E7%97%B4	战斗中，每回合选择一名敌军单体，自身发动的所有攻击都会锁定该目标，对其造成的伤害提高33%（受武力影响），如果击败目标会使自身获得破阵状态（造成伤害时无视目标的统率和智力），直到战斗结束	战斗中, mỗi lượtchọn一名đơn thể địch, bản thân phát động 所có tấn công đều 会锁定该mục tiêu, đối với 其gây sát thươngtăng 33% (chịu vũ lực ảnh hưởng), nếu 击败mục tiêu会khiến bản thân nhận được 破阵trạng thái (gây sát thương khi bỏ qua mục tiêu thống suất和trí lực), 直 đến 战斗kết thúc	敌军全体	Toàn bộ địch	{cavalry,shield,archer,spear,siege}	{许褚}	{许褚}	innate	\N	\N	\N	2026-01-16 01:51:50.966	2026-01-16 01:51:50.966	needs_update
149	\N	虎豹骑	Hổ Báo Kỵ	troop	troop	Binh chủng	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E8%99%8E%E8%B1%B9%E9%AA%91	将骑兵进阶为天下骁锐的虎豹骑：我军全体提高40点武力，战斗前三回合，我军全体突击战法发动率提高10%，若曹纯统领时，提升的发动概率额外受武力影响	将kỵ binh进阶là 天下骁锐 虎豹骑: toàn bộ quân ta tăng 40 điểmvũ lực, 战斗前三 lượt, toàn bộ quân ta 突击chiến phápphát động率tăng 10%, nếu 曹纯统领 khi, tăng phát động xác suất thêm chịu vũ lực ảnh hưởng	我军全体	Toàn bộ quân ta	{cavalry}	{曹纯}	{曹纯}	innate	\N	\N	\N	2026-01-16 01:51:50.967	2026-01-16 01:51:50.967	needs_update
150	\N	西凉铁骑	Tây [凉] Thiết Kỵ	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{马腾}	{马腾}	innate	\N	\N	\N	2026-01-16 01:51:50.968	2026-01-16 01:51:50.968	needs_update
151	\N	誓守无降	[誓] Thủ Vô Giáng	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{严颜}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.968	2026-01-16 01:51:50.968	needs_update
152	\N	诱敌深入	[诱] Địch Thâm [入]	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{华雄,司马徵}	inheritance	\N	\N	\N	2026-01-16 01:51:50.969	2026-01-16 01:51:50.969	needs_update
153	\N	象兵	Tượng Binh	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{木鹿大王}	{木鹿大王}	innate	\N	\N	\N	2026-01-16 01:51:50.97	2026-01-16 01:51:50.97	needs_update
154	\N	运筹决算	Vận Trù Quyết Toán	active	active	Chủ động	S	55	inherited	https://wiki.biligame.com/sgzzlb/%E8%BF%90%E7%AD%B9%E5%86%B3%E7%AE%97	准备1回合，对敌军全体发动一次谋略攻击（伤害率176%，受智力影响）	chuẩn bị 1 lượt, đối với toàn bộ địch phát động一 lầnsát thương mưu lược (tỉ lệ sát thương 176%, chịu trí lực ảnh hưởng)	敌军全体	Toàn bộ địch	{cavalry,archer}	{}	{张春华,荀攸}	inheritance	\N	\N	\N	2026-01-16 01:51:50.971	2026-01-16 01:51:50.971	needs_update
155	\N	连环计	Liên 环 Kế	active	active	Chủ động	S	35	innate	https://wiki.biligame.com/sgzzlb/%E8%BF%9E%E7%8E%AF%E8%AE%A1	准备1回合，对敌军全体施放铁索连环，使其任一目标受到伤害时会反馈15%（受智力影响）伤害给其他单位，持续2回合，并发动谋略攻击（伤害率156%，受智力影响）	chuẩn bị 1 lượt, đối với toàn bộ địch 施放铁索连环, khiến 其任一mục tiêuchịu sát thương khi 会反馈15% (chịu trí lực ảnh hưởng) sát thương cho 其他单位, kéo dài 2 lượt, và phát độngsát thương mưu lược (tỉ lệ sát thương 156%, chịu trí lực ảnh hưởng)	敌军全体	Toàn bộ địch	{cavalry,shield,archer,spear,siege}	{庞统}	{庞统}	innate	\N	\N	\N	2026-01-16 01:51:50.972	2026-01-16 01:51:50.972	needs_update
156	\N	速乘其利	Tốc Thừa Kỳ Lợi	assault	assault	Đột kích	S	35	inherited	https://wiki.biligame.com/sgzzlb/%E9%80%9F%E4%B9%98%E5%85%B6%E5%88%A9	普通攻击之后，对目标发动一次兵刃攻击（伤害率185%）并计穷（无法发动主动战法）1回合	普通tấn công, sau đó, đối với mục tiêuphát động一 lầnsát thương vật lý (tỉ lệ sát thương 185%), và kế cùng (không thể phát độngchiến pháp chủ động)1 lượt	敌军单体	Đơn thể địch	{cavalry,shield,archer,spear,siege}	{}	{王元姬,sp朱儁}	inheritance	\N	\N	\N	2026-01-16 01:51:50.973	2026-01-16 01:51:50.973	needs_update
157	\N	酒池肉林	[酒] [池] Nhục Lâm	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{董卓}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.974	2026-01-16 01:51:50.974	needs_update
158	\N	金丹秘术	Kim [丹] [秘] Thuật	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{左慈}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.975	2026-01-16 01:51:50.975	needs_update
159	\N	金城汤池	金 城 汤 池	command	command	Chỉ huy	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E9%87%91%E5%9F%8E%E6%B1%A4%E6%B1%A0	无法发动普通攻击（无法被净化），每2回合轮流执行:治疗我军群体（2人，治疗率98%，受智力影响）；对敌军群体造成兵刃伤害（伤害率102%）及灼烧状态，每回合持续造成伤害（伤害率72%，受智力影响），持续1回合	không thể phát động普通tấn công (không thể bị 净化), mỗi 2 lượt轮流thực hiện:hồi phụcnhóm quân ta (2 người, hồi phục率98%, chịu trí lực ảnh hưởng); đối với nhóm địch gây sát thương vật lý (tỉ lệ sát thương 102%) và 灼烧trạng thái, mỗi lượt kéo dài gây sát thương (tỉ lệ sát thương 72%, chịu trí lực ảnh hưởng), kéo dài 1 lượt	我军群体及敌军群体	nhóm quân ta và nhóm địch	{cavalry,shield,archer,spear,siege}	{郝昭}	{郝昭}	innate	\N	\N	\N	2026-01-16 01:51:50.976	2026-01-16 01:51:50.976	needs_update
160	\N	锋矢阵	Phong 矢 Trận	formation	formation	Trận pháp	S	\N	inherited	https://wiki.biligame.com/sgzzlb/%E9%94%8B%E7%9F%A2%E9%98%B5	战斗中，使我军主将造成的伤害提升30%，受到的伤害提升20%；我军副将造成的伤害降低15%，受到的伤害降低25%	战斗中, khiến quân ta 主将gây sát thươngtăng 30%, chịu sát thươngtăng 20%; quân ta 副将gây sát thươnggiảm 15%, chịu sát thươnggiảm 25%	我军全体	Toàn bộ quân ta	{cavalry,shield,spear}	{}	{乐进,黄月英}	inheritance	\N	\N	\N	2026-01-16 01:51:50.977	2026-01-16 01:51:50.977	needs_update
161	\N	锋芒毕露	[锋] [芒] [毕] Lộ	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{马忠}	inheritance	\N	\N	\N	2026-01-16 01:51:50.978	2026-01-16 01:51:50.978	needs_update
162	\N	锦囊妙计	锦 Nang Diệu Kế	command	command	Chỉ huy	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E9%94%A6%E5%9B%8A%E5%A6%99%E8%AE%A1	战斗中，奇数回合有32%概率（受智力影响），偶数回合有75%概率（受智力影响）使友军单体的自带主动战法发动率提高100%且有25%概率跳过1回合准备，持续1回合；自身为主将时，触发时额外对敌军单体造成谋略伤害（伤害率45%，受智力及双方智力差影响）并使跳过概率提高至80%	战斗中, 奇数 lượt có 32% xác suất (chịu trí lực ảnh hưởng), 偶数 lượt có 75% xác suất (chịu trí lực ảnh hưởng) khiến đồng minh đơn thể 自带chiến pháp chủ độngphát động率tăng 100%且có 25% xác suất 跳过1 lượtchuẩn bị, kéo dài 1 lượt; bản thân là 主将 khi, kích hoạt khi thêm đối với đơn thể địch gây sát thương mưu lược (tỉ lệ sát thương 45%, chịu trí lực và 双方trí lực差 ảnh hưởng), và khiến 跳过 xác suất tăng 至80%	友军单体	Đơn thể đồng minh	{cavalry,shield,archer,spear,siege}	{sp诸葛亮}	{sp诸葛亮}	innate	\N	\N	\N	2026-01-16 01:51:50.979	2026-01-16 01:51:50.979	needs_update
163	\N	锦帆百翎	[锦] [帆] Bách [翎]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{甘宁}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.98	2026-01-16 01:51:50.98	needs_update
164	\N	镇扼防拒	镇 扼 Phòng 拒	command	command	Chỉ huy	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E9%95%87%E6%89%BC%E9%98%B2%E6%8B%92	每回合有50%概率（受智力影响）使我军单体（优先选除自己之外的副将）援护所有友军并获得休整状态（每回合恢复一次兵力，治疗率192%，受智力影响），持续1回合，同时使其在1回合内受到普通攻击时，有55%概率（受智力影响）移除攻击者的增益状态	mỗi lượtcó 50% xác suất (chịu trí lực ảnh hưởng) khiến đơn thể quân ta (优先选除bản thân 之外 副将) viện hộ所có đồng minh, và nhận được trạng thái nghỉ ngơi (mỗi lượthồi phục一 lầnbinh lực, hồi phục率192%, chịu trí lực ảnh hưởng), kéo dài 1 lượt, đồng thờikhiến 其 trong 1 lượt内chịu 普通tấn công khi, có 55% xác suất (chịu trí lực ảnh hưởng) loại bỏ tấn công者 增益trạng thái	我军单体	Đơn thể quân ta	{cavalry,shield,archer,spear,siege}	{满宠}	{郝昭}	innate	\N	\N	\N	2026-01-16 01:51:50.981	2026-01-16 01:51:50.981	needs_update
165	\N	长驱直入	Trường Khu Trực Nhập	passive	passive	Bị động	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E9%95%BF%E9%A9%B1%E7%9B%B4%E5%85%A5	战斗中，每次造成兵刃伤害后，使自己造成的兵刃伤害提升15%，最大叠加5次；叠加5次后，使我军全体受到伤害降低16%（受武力影响），持续2回合	战斗中, mỗi lầngây sát thương vật lý后, khiến bản thân gây sát thương vật lýtăng 15%, nhất 大cộng dồn5 lần; cộng dồn5 lần后, khiến toàn bộ quân ta chịu sát thươnggiảm 16% (chịu vũ lực ảnh hưởng), kéo dài 2 lượt	自己	bản thân	{cavalry,shield,archer,spear,siege}	{徐晃}	{徐晃}	innate	\N	\N	\N	2026-01-16 01:51:50.983	2026-01-16 01:51:50.983	needs_update
166	\N	闭月	Bế Nguyệt	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{貂蝉}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.984	2026-01-16 01:51:50.984	needs_update
167	\N	陷阵突袭	Hãm Trận Đột Tập	passive	passive	Bị động	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E9%99%B7%E9%98%B5%E7%AA%81%E8%A2%AD	战斗中，使自己的普通攻击目标有68%几率锁定为敌军主将， 自身突击战法的发动几率提高15%并使自己成功发动突击战法后，对目标额外发动一次兵刃攻击（伤害率95%；自身为主将时，获得6%倒戈	战斗中, khiến bản thân 普通tấn côngmục tiêucó 68%xác suất锁定là địch 主将, bản thân 突击chiến pháp phát độngxác suấttăng 15%, và khiến bản thân 成功phát động突击chiến pháp后, đối với mục tiêuthêm phát động一 lầnsát thương vật lý (tỉ lệ sát thương 95%; bản thân là 主将 khi, nhận được 6%倒戈	自己	bản thân	{cavalry,shield,archer,spear,siege}	{张辽}	{张辽}	innate	\N	\N	\N	2026-01-16 01:51:50.985	2026-01-16 01:51:50.985	needs_update
168	\N	陷阵营	[陷] Trận [营]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{高顺}	{高顺}	innate	\N	\N	\N	2026-01-16 01:51:50.986	2026-01-16 01:51:50.986	needs_update
169	\N	震骇四境	Chấn 骇 四 境	active	active	Chủ động	S	35	innate	https://wiki.biligame.com/sgzzlb/%E9%9C%87%E9%AA%87%E5%9B%9B%E5%A2%83	发动2次对敌军单体的兵刃攻击（伤害率178%），分别造成使其首次受到兵刃伤害提高30%（受物理影响）及计穷（无法发动主动战法）状态，持续1回合，每次目标独立选择	phát động2 lầnđối với đơn thể địch sát thương vật lý (tỉ lệ sát thương 178%), 分别gây khiến 其lần đầuchịu sát thương vật lýtăng 30% (chịu 物理 ảnh hưởng) và kế cùng (không thể phát độngchiến pháp chủ động) trạng thái, kéo dài 1 lượt, mỗi lầnmục tiêu独立chọn	敌军单体	Đơn thể địch	{cavalry,shield,archer,spear,siege}	{王双}	{王双}	innate	\N	\N	\N	2026-01-16 01:51:50.988	2026-01-16 01:51:50.988	needs_update
170	\N	青囊	Thanh [囊]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{华佗}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.989	2026-01-16 01:51:50.989	needs_update
171	\N	顾盼生姿	[顾] [盼] Sinh [姿]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{邹氏}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.99	2026-01-16 01:51:50.99	needs_update
172	\N	风助火势	[风] [助] [火] Thế	unknown	unknown	Không xác định	S	\N	inherited	\N	\N	\N	\N	\N	{}	{}	{周瑜,黄盖}	inheritance	\N	\N	\N	2026-01-16 01:51:50.991	2026-01-16 01:51:50.991	needs_update
173	\N	高橹连营	Cao [橹] [连] [营]	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{sp袁绍}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.992	2026-01-16 01:51:50.992	needs_update
174	\N	魅惑	Mị Hoặc	passive	passive	Bị động	S	\N	inherited	https://wiki.biligame.com/sgzzlb/%E9%AD%85%E6%83%91	自己受到普通攻击时，有22.5%几率使攻击者进入混乱（攻击和战法无差别选择目标）、计穷（无法发动主动战法）、虚弱（无法造成伤害）状态的一种，持续1回合，自身为女性时，触发几率额外受智力影响	bản thân chịu 普通tấn công khi, có 22.5%xác suấtkhiến tấn công者rơi vào hỗn loạn (tấn công和chiến phápkhông 差别chọnmục tiêu)、kế cùng (không thể phát độngchiến pháp chủ động)、suy yếu (không thể gây sát thương) trạng thái 一种, kéo dài 1 lượt, bản thân là 女性 khi, kích hoạtxác suấtthêm chịu trí lực ảnh hưởng	普攻来源	普攻来源	{cavalry,shield,archer,spear,siege}	{}	{甄姬,大乔}	inheritance	\N	\N	\N	2026-01-16 01:51:50.993	2026-01-16 01:51:50.993	needs_update
175	\N	鸩毒	[鸩] Độc	unknown	unknown	Không xác định	S	\N	innate	\N	\N	\N	\N	\N	{}	{李儒}	{}	innate	\N	\N	\N	2026-01-16 01:51:50.994	2026-01-16 01:51:50.994	needs_update
177	\N	鹰视狼顾	Ưng Thị Lang Cố	command	command	Chỉ huy	S	\N	innate	https://wiki.biligame.com/sgzzlb/%E9%B9%B0%E8%A7%86%E7%8B%BC%E9%A1%BE	战斗前4回合，每回合有80%概率使自身获得7%攻心或奇谋几率（每种效果最多叠加2次）；第5回合起，每回合有80%概率对1-2个敌军单体造成谋略伤害（伤害率154%，受智力影响）；自身为主将时，获得16%奇谋几率	战斗前4 lượt, mỗi lượtcó 80% xác suất khiến bản thân nhận được 7%攻心 hoặc kỳ mưuxác suất (mỗi 种hiệu quảtối đa cộng dồn2 lần); 第5 lượt起, mỗi lượtcó 80% xác suất đối với 1-2个đơn thể địch gây sát thương mưu lược (tỉ lệ sát thương 154%, chịu trí lực ảnh hưởng); bản thân là 主将 khi, nhận được 16%kỳ mưuxác suất	先增益自身后对敌军群体（1-2人）	先增益bản thân 后đối với nhóm địch (1-2 người)	{cavalry,shield,archer,spear,siege}	{司马懿}	{司马懿}	innate	\N	\N	\N	2026-01-16 01:51:50.996	2026-01-16 01:51:50.996	needs_update
178	\N	黄天泰平	黄 Thiên 泰 平	active	active	Chủ động	S	35	inherited	https://wiki.biligame.com/sgzzlb/%E9%BB%84%E5%A4%A9%E6%B3%B0%E5%B9%B3	准备1回合，以自己进入混乱（攻击和战法无差别选择目标）状态为代价，使敌军群体（2人）进入计穷（无法发动主动战法）状态，持续2回合	chuẩn bị 1 lượt, 以bản thân rơi vào hỗn loạn (tấn công和chiến phápkhông 差别chọnmục tiêu) trạng tháilà 代价, khiến nhóm địch (2 người) rơi vào kế cùng (không thể phát độngchiến pháp chủ động) trạng thái, kéo dài 2 lượt	自己及敌军群体（2人）	bản thân và nhóm địch (2 người)	{cavalry,shield,archer,spear,siege}	{}	{张角}	inheritance	\N	\N	\N	2026-01-16 01:51:50.997	2026-01-16 01:51:50.997	needs_update
179	linh-dan-duong	灵幡督阵	Lính Đan Dương	troop	指挥	Binh Chủng	S	100	\N	\N	先锋灵兆成阵灵幡督阵凶猛无畏：通岁全体军团全18→36点，且预备开始给每个军队增强军团全体再次改变缓慢伤害岁18%→36%伤害Muu Lục，Số lượng Linh Ban Dương每队减少10%；如果敌方指令，则类型敌方将增加到20%→40%	Tiên bạc Linh Khiên thành Linh Ban Dương dũng mãnh vô uy: Thông Soái toàn thể quân ta tăng 18→36 điểm, và trước khi bắt đầu mỗi hiệp, cần cứ vào sát thương binh đao toàn thể quân ta gây ra ở hiệp trước để nhân tỷ lệ Linh Ban Dương nhất định, được cộng dồn (Khi quân ta chịu sát thương mưu lược, sẽ tiêu hao Linh Ban Dương để chống đỡ 18%→36% sát thương Mưu Lược, số lượng Linh Ban Dương mỗi hiệp sẽ suy giảm10%); Nếu Đao Khiêm thông linh, thì tỷ lệ chống đỡ sẽ tăng đến 20%→40%	ally_all	Tập thể quân ta (3 người)	{spear,shield}	{}	{}	exchange	any	{}	2	2026-01-16 02:15:44.057	2026-01-16 02:15:44.057	needs_update
17	nguy-thu-tuong-gian	御雷突击	Ngụy Thư Tương Gian	active	指挥	Chủ Động	S	45	inherited	https://wiki.biligame.com/sgzzlb/%E4%BC%AA%E4%B9%A6%E7%9B%B8%E9%97%B4	给予目标群体伤害率物理攻击(伤害率103%→206%,受策略影响),若目标在攻击状态混乱时会使目标发动攻击向自己军队冲击(伤害率93%→186%,根据形状调整防御和战法,策略伤害更高),若没有发动攻击混乱(攻击和战法无法区分选择目标),维持1回合。	Gây cho cá thể quân địch sát thương Mưu Lược (tỷ lệ sát thương 103%→206%, bị Trí Lực ảnh hưởng), nếu mục tiêu trong trạng thái Hỗn Loạn thì sẽ khiến mục tiêu phát động tấn công vào cả thể quân Đồng Minh (tỷ lệ sát thương 93%→186%, loại hình tùy thuộc hai hạng mục Vô Lực, Trí Lực bên nào cao hơn), nếu không sẽ phóng trạng thái Hỗn Loạn (tấn công và Chiến Pháp sẽ không phân biệt khi lựa chọn mục tiêu), duy trì 1 hiệp.	enemy_1	Một quân địch	{cavalry,shield,archer,spear,siege}	{"Nguy Thu Tương Gian"}	{贾诩}	inherit	\N	{}	\N	2026-01-16 01:51:50.805	2026-01-16 02:24:32.106	needs_update
29	cat-xuong-tri-doc	除恶诛毒	Cắt Xương Trị Độc	active	主动	Chủ động	S	40	inherited	\N	\N	Xúa trang thái xấu cho cả thể quân ta có tổn thất Binh Lực nhiều nhất và hồi phục Binh Lực cho mục tiêu (tỷ lệ Trí Liệu 128% -> 256%, bị Trí Lực ảnh hưởng)	enemy_all	Tất cả địch	{cavalry,shield,archer,spear,siege}	{}	{"Tuân Úc"}	inherit	\N	{}	\N	2026-01-16 01:51:50.822	2026-01-16 02:42:30.667	needs_update
180	nhan-loi-che-quyen	利刃裁权	Nhân Lợi Chế Quyền	active	主动	Chủ động	S	30	\N	\N	使我军整体(2-3人)获得12.5%~25%规避(受影响目标等级越高，规避越高：统率或智力)	Khiến quân thể quân ta (2-3 người) nhận 12.5%~25% Né Tránh (Chịu ảnh hưởng của mức cao hơn trong: Tốc Độ hoặc Thống Soái), duy trì 1 hiệp, sau khi phát động Chiến Pháp này sẽ vào 1 hiệp CD (Xác suất phát động 30%→55%)	ally_2_3	Tập thể quân ta (2-3 người)	{cavalry,archer,siege,shield,spear}	{}	{}	inherit	\N	{}	\N	2026-01-16 03:14:38.387	2026-01-16 11:09:53.717	complete
3	nhat-ky-duong-thien	一骑当千	Nhất Kỵ Đương Thiên	assault	unknown	Đột Kích	S	30	inherited	\N	\N	Sau khi tấn công thường, phát động 1 lần tấn công Binh Đao cho toàn thể quân địch (tỷ lệ sát thương 36%→72%); khi bản thân là Chủ Tướng, lần tấn công Binh Đao này sẽ càng mạnh (tỷ lệ sát thương 54%→108%)	enemy_all	toàn thể quân địch	{cavalry,archer,spear,shield}	{}	{吕布}	inherit	\N	{}	\N	2026-01-16 01:51:50.784	2026-01-16 08:48:59.269	complete
1	nhat-luc-cu-thu	一力当千	Nhất Lực Cự Thủ	active	主动	Chủ động	S	55	inherited	\N	恢复兵力并对敌军造成谋略伤害(伤害率134%→268%)，同时提升10.5→21统率，可叠加，持续3回合；当自身为副将时，统率提升和恢复兵力将影响更高级目标在武力或智力	Khôi phục Binh Lực của bản thân (tỷ lệ Trị Liệu 134%→268%) và tăng 10.5→21 Thống Soái, có thể cộng dồn, duy trì 3 hiệp; khi bản thân là Phó Tướng, Thống Soái tăng và khôi phục binh lực sẽ chịu ảnh hưởng mục cao hơn trong Võ Lực hoặc Trí Lực	enemy_1_2	1-2 địch	{cavalry,shield,spear}	{}	{严颜,周泰}	inheritance	\N	{}	\N	2026-01-16 01:51:50.779	2026-01-16 06:29:51.5	complete
52	thien-ha-vo-song	天火无双	Thiên Hạ Vô Song	active	主动	Chủ động	S	35	innate	\N	发动战斗的最高攻击力对方全部队伍，两支决斗队两轮攻击轮流对方攻击3轮，炮身射出手前。在过程决斗过程中，两支不承受影响状态镇东和交兵器，同时可以激活状态官公和战法点击；器官炮身激活状态官公和战法点击	Phát động chiến đấu tối có thể quân địch, hai bên quyết đấu lần lượt tấn công thường đối phương 3 lần, bản thân ra tay trước. Trong quá trình quyết đấu, hai bên không chịu ảnh hưởng trạng thái Chấn Động và Giáo Binh Khí, đồng thời có thể kích hoạt trạng thái Quân Công và Chiến Pháp Độc Kích; Khi bản thân là tướng Chính, trước quyết đấu khiến sát thương bản thân chịu phải giảm 3.5% -> 7% (chịu ảnh hưởng Võ Lực), duy trì 2 hiệp (Xác suất phát động 25% -> 35%)	enemy_all	Tất cả địch	{cavalry,shield,archer,spear,siege}	{吕布}	{}	innate	\N	{}	\N	2026-01-16 01:51:50.853	2026-01-16 08:00:36.349	complete
40	hop-quan-tu-chung	合纵拒冲	Hợp Quân Tự Chúng	passive	被动	Bị động	S	100	inherited	https://wiki.biligame.com/sgzzlb/%E5%90%88%E5%86%9B%E8%81%9A%E4%BC%97	战斗开始时，使己方全体复兵种最高的（优先级骑兵52%→盾兵24%，受到谋略伤害时概率更高：智略或骑兵）	Trong chiến đấu, bản thân mỗi hiệp hồi phục Binh Lực nhất định (tỷ lệ Trí Liệu 52%→124%, chịu ảnh hưởng thuộc tính cao hơn trong: Thống Soái hoặc Trí Lực)	self	Bản thân	{cavalry,shield,archer,spear,siege}	{}	{徐晃,袁绍}	inherit	\N	{}	\N	2026-01-16 01:51:50.837	2026-01-16 10:46:22.833	complete
5	van-tien-te-phat	万箭穿心	Vạn Tiễn Tề Phát	active	主动	Chủ động	S	40	inherited	https://wiki.biligame.com/sgzzlb/%E4%B8%87%E7%AE%AD%E9%BD%90%E5%8F%91	准备1回合，对敌全体造成兵刃伤害(伤害率70%→140%)，并有75%概率造成混乱状态，每回合持续造成兵刃伤害(伤害率80%→120%，受智力影响Vo Lực)，持续1回合	Chuẩn bị 1 hiệp, tạo tấn công bình dao cho toàn thể quân địch (Tỷ lệ sát thương 70%→140%), và có 75% xác suất tạo trạng thái Bô Chạy, mỗi hiệp duy trì tạo sát thương (Tỷ lệ sát thương 80%→120%, chịu ảnh hưởng Võ Lực), duy trì 1 hiệp	enemy_all	Tất cả địch	{archer}	{}	{夏侯渊,黄忠}	inherit	\N	{}	\N	2026-01-16 01:51:50.787	2026-01-16 08:34:19.306	complete
93	hoanh-tao-thien-quan	横扫千军	Hoành Tảo Thiên Quân	active	主动	Chủ động	S	40	inherited	https://wiki.biligame.com/sgzzlb/%E6%A8%AA%E6%89%AB%E5%8D%83%E5%86%9B	对全体敌军造成50%→100%谋略伤害，若目标已处于震慑或交兵状态则有20%→30%几率使目标进入震慑状态（无法行动），持续1回合	Gây cho toàn thể quân địch 50%→100% sát thương Binh Bảo, nếu mục tiêu đã ở trong trạng thái Kế Tấn hoặc Giao Binh Khí thì sẽ có 20%→30% xác suất làm cho mục tiêu rơi vào trạng thái Chấn Động (không thể hành động), duy trì 1 hiệp	enemy_all	Tất cả địch	{cavalry,shield,archer,spear,siege}	{}	{关羽,赵云}	inherit	\N	{}	\N	2026-01-16 01:51:50.902	2026-01-16 08:50:55.669	needs_update
181	nhan-duc-tai-the	Nhân Đức	Nhân Đức Tái Thế	command	指挥	Chỉ huy	S	100	\N	\N	\N	Mỗi hiệp trị liệu nhóm (2-3 người, tỷ lệ Trị Liệu 34%→68%, ảnh hưởng bởi Trí Lực) quân ta và khiển sát thương phải chịu của mục tiêu giảm 4% (ảnh hưởng bởi Trí Lực), duy trì 1 hiệp, đồng thời có 5%→10% xác suất gây cho 1 quân địch trạng thái Suy Nhược (không thể gây sát thương), duy trì 1 hiệp, khi bản thân là Chủ Tướng, xác suất gây trạng thái Suy Nhược tăng đến 12.5% →25%	ally_2_3	Tập thể quân ta (2 người)	{cavalry,shield,archer,spear,siege}	{}	{}	innate	\N	{}	\N	2026-01-16 09:00:48.202	2026-01-16 09:00:54.514	complete
25	binh-vo-thuong-the	无双霸世	Bình Vô Thường Thế	command	指挥	Chỉ huy	S	100	inherited	\N	\N	Trong chiến đấu, khi bản thân tích lũy tiến hành tấn công thường lần thứ 3, sẽ gây cho mục tiêu tấn công sát thương Mưu Lược (tỷ lệ sát thương 120% → 240%, bị Trí Lực ảnh hưởng), và Trí Liệu cho bản thân (tỷ lệ Trí Liệu 90% → 180%, bị Trí Lực ảnh hưởng)	enemy_1	1 địch	{cavalry,shield,archer,spear,siege}	{}	{田丰,祝融夫人}	inherit	\N	{}	\N	2026-01-16 01:51:50.817	2026-01-16 10:51:25.809	complete
\.


--
-- Name: skill_exchange_generals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.skill_exchange_generals_id_seq', 17, true);


--
-- Name: skill_inherit_generals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.skill_inherit_generals_id_seq', 35, true);


--
-- Name: skill_innate_generals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.skill_innate_generals_id_seq', 7, true);


--
-- Name: skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.skills_id_seq', 181, true);


--
-- Name: generals generals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generals
    ADD CONSTRAINT generals_pkey PRIMARY KEY (id);


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
-- Name: generals_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX generals_slug_key ON public.generals USING btree (slug);


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
-- Name: skills_name_cn_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX skills_name_cn_key ON public.skills USING btree (name_cn);


--
-- Name: skills_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX skills_slug_key ON public.skills USING btree (slug);


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

\unrestrict WQqxDwBWfkcPLGQHCBx2hIg8vBYxxXwKwbzbl6xlVRhdOQhtE1zf3YCqxFnYxMJ

