--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

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
-- Name: BccStatus; Type: TYPE; Schema: public; Owner: galib
--

CREATE TYPE public."BccStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED'
);


ALTER TYPE public."BccStatus" OWNER TO galib;

--
-- Name: BccTransactionType; Type: TYPE; Schema: public; Owner: galib
--

CREATE TYPE public."BccTransactionType" AS ENUM (
    'RENT_DEPOSIT',
    'DEPOSIT_REFUND',
    'BONUS_CREDIT',
    'PURCHASE_BCC',
    'MONEY_WITHDRAWAL',
    'ADJUSTMENT'
);


ALTER TYPE public."BccTransactionType" OWNER TO galib;

--
-- Name: BrittoTerminal; Type: TYPE; Schema: public; Owner: galib
--

CREATE TYPE public."BrittoTerminal" AS ENUM (
    'CSE_1',
    'ADMIN_1',
    'BANGABANDHU_HALL_1',
    'ZIA_HALL_1',
    'LIBRARY_1'
);


ALTER TYPE public."BrittoTerminal" OWNER TO galib;

--
-- Name: CollectionOrDepositMethod; Type: TYPE; Schema: public; Owner: galib
--

CREATE TYPE public."CollectionOrDepositMethod" AS ENUM (
    'BRITTOO_TERMINAL',
    'HOME'
);


ALTER TYPE public."CollectionOrDepositMethod" OWNER TO galib;

--
-- Name: PaymentGateway; Type: TYPE; Schema: public; Owner: galib
--

CREATE TYPE public."PaymentGateway" AS ENUM (
    'BKASH',
    'NAGAD',
    'ROCKET'
);


ALTER TYPE public."PaymentGateway" OWNER TO galib;

--
-- Name: ProductCondition; Type: TYPE; Schema: public; Owner: galib
--

CREATE TYPE public."ProductCondition" AS ENUM (
    'NEW',
    'LIKE_NEW',
    'GOOD',
    'FAIR',
    'POOR'
);


ALTER TYPE public."ProductCondition" OWNER TO galib;

--
-- Name: ProductType; Type: TYPE; Schema: public; Owner: galib
--

CREATE TYPE public."ProductType" AS ENUM (
    'GADGET',
    'FURNITURE',
    'VEHICLE',
    'STATIONARY',
    'MUSICAL_INSTRUMENT',
    'CLOTHING',
    'BOOK',
    'ACADEMIC_BOOK',
    'ELECTRONICS',
    'APARTMENTS',
    'OTHERS'
);


ALTER TYPE public."ProductType" OWNER TO galib;

--
-- Name: RentalRequestStatus; Type: TYPE; Schema: public; Owner: galib
--

CREATE TYPE public."RentalRequestStatus" AS ENUM (
    'REQUESTED_BY_RENTER',
    'CANCELLED_BY_RENTER',
    'ACCEPTED_BY_OWNER',
    'REJECTED_BY_OWNER',
    'REJECTED_FROM_BRITTOO',
    'PRODUCT_SUBMITTED_BY_OWNER',
    'PRODUCT_COLLECTED_BY_RENTER',
    'PRODUCT_RETURNED_BY_RENTER',
    'PRODUCT_RETURNED_TO_OWNER'
);


ALTER TYPE public."RentalRequestStatus" OWNER TO galib;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: galib
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN',
    'MODERATOR'
);


ALTER TYPE public."Role" OWNER TO galib;

--
-- Name: SecurityScore; Type: TYPE; Schema: public; Owner: galib
--

CREATE TYPE public."SecurityScore" AS ENUM (
    'VERY_LOW',
    'LOW',
    'MID',
    'HIGH',
    'VERY_HIGH'
);


ALTER TYPE public."SecurityScore" OWNER TO galib;

--
-- Name: VerifyStatus; Type: TYPE; Schema: public; Owner: galib
--

CREATE TYPE public."VerifyStatus" AS ENUM (
    'UNVERIFIED',
    'VERIFIED',
    'PENDING',
    'REJECTED',
    'BLOCKED'
);


ALTER TYPE public."VerifyStatus" OWNER TO galib;

--
-- Name: WithdrawalStatus; Type: TYPE; Schema: public; Owner: galib
--

CREATE TYPE public."WithdrawalStatus" AS ENUM (
    'PENDING',
    'REJECTED',
    'COMPLETED'
);


ALTER TYPE public."WithdrawalStatus" OWNER TO galib;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: SuspensionReason; Type: TABLE; Schema: public; Owner: galib
--

CREATE TABLE public."SuspensionReason" (
    id text NOT NULL
);


ALTER TABLE public."SuspensionReason" OWNER TO galib;

--
-- Name: _ProductsBorrowed; Type: TABLE; Schema: public; Owner: galib
--

CREATE TABLE public."_ProductsBorrowed" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ProductsBorrowed" OWNER TO galib;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: galib
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO galib;

--
-- Name: bcc_transactions; Type: TABLE; Schema: public; Owner: galib
--

CREATE TABLE public.bcc_transactions (
    id text NOT NULL,
    user_id text NOT NULL,
    walllet_id text NOT NULL,
    rental_request_id text,
    amount integer NOT NULL,
    payment_gateway public."PaymentGateway",
    transaction_id text,
    number_used_in_trx text,
    transaction_type public."BccTransactionType" NOT NULL,
    status public."BccStatus" DEFAULT 'PENDING'::public."BccStatus",
    reject_reason text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.bcc_transactions OWNER TO galib;

--
-- Name: bcc_wallets; Type: TABLE; Schema: public; Owner: galib
--

CREATE TABLE public.bcc_wallets (
    id text NOT NULL,
    user_id text NOT NULL,
    available_balance integer DEFAULT 0 NOT NULL,
    locked_balance integer DEFAULT 0 NOT NULL,
    requested_for_withdrawal integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.bcc_wallets OWNER TO galib;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: galib
--

CREATE TABLE public.password_reset_tokens (
    id text NOT NULL,
    token text NOT NULL,
    user_id text NOT NULL,
    used boolean DEFAULT false NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO galib;

--
-- Name: products; Type: TABLE; Schema: public; Owner: galib
--

CREATE TABLE public.products (
    id text NOT NULL,
    product_sl_no integer NOT NULL,
    product_sl text NOT NULL,
    name text NOT NULL,
    price_per_day numeric(65,30),
    product_images text[],
    product_type public."ProductType" NOT NULL,
    product_condition public."ProductCondition" NOT NULL,
    product_age integer NOT NULL,
    omv integer NOT NULL,
    second_hand_price integer NOT NULL,
    tags text NOT NULL,
    product_description text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    owner_id text NOT NULL,
    is_on_hold boolean DEFAULT false NOT NULL,
    hold_start_date timestamp(3) without time zone,
    hold_end_date timestamp(3) without time zone,
    is_for_sale boolean NOT NULL,
    is_rented boolean DEFAULT false NOT NULL,
    is_brittoo_verified boolean DEFAULT false NOT NULL,
    hold_credit_validity integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.products OWNER TO galib;

--
-- Name: products_product_sl_no_seq; Type: SEQUENCE; Schema: public; Owner: galib
--

CREATE SEQUENCE public.products_product_sl_no_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_product_sl_no_seq OWNER TO galib;

--
-- Name: products_product_sl_no_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: galib
--

ALTER SEQUENCE public.products_product_sl_no_seq OWNED BY public.products.product_sl_no;


--
-- Name: red_cache_credits; Type: TABLE; Schema: public; Owner: galib
--

CREATE TABLE public.red_cache_credits (
    id text NOT NULL,
    amount integer NOT NULL,
    in_use integer DEFAULT 0 NOT NULL,
    renter_id text,
    user_id text NOT NULL,
    source_product_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.red_cache_credits OWNER TO galib;

--
-- Name: rental_request_rcc_usage; Type: TABLE; Schema: public; Owner: galib
--

CREATE TABLE public.rental_request_rcc_usage (
    id text NOT NULL,
    rental_request_id text NOT NULL,
    red_cache_credit_id text NOT NULL,
    used_amount integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.rental_request_rcc_usage OWNER TO galib;

--
-- Name: rental_requests; Type: TABLE; Schema: public; Owner: galib
--

CREATE TABLE public.rental_requests (
    id text NOT NULL,
    product_id text NOT NULL,
    requester_id text NOT NULL,
    owner_id text NOT NULL,
    bcc_wallet_id text,
    status public."RentalRequestStatus" DEFAULT 'REQUESTED_BY_RENTER'::public."RentalRequestStatus" NOT NULL,
    reject_reason text,
    brittoo_reject_reason text,
    cancel_reason text,
    submission_deadline timestamp(3) without time zone,
    rental_start_date timestamp(3) without time zone NOT NULL,
    rental_end_date timestamp(3) without time zone NOT NULL,
    total_days integer NOT NULL,
    owner_submit_method public."CollectionOrDepositMethod",
    renter_collection_method public."CollectionOrDepositMethod" NOT NULL,
    owner_phone_number text,
    renter_phone_number text NOT NULL,
    renter_delivery_address text,
    pickup_terminal public."BrittoTerminal",
    owner_submit_address text,
    owner_submit_terminal public."BrittoTerminal",
    renter_return_method public."CollectionOrDepositMethod",
    renter_return_address text,
    renter_return_terminal public."BrittoTerminal",
    owner_return_receive_method public."CollectionOrDepositMethod",
    owner_return_receive_address text,
    owner_return_receive_terminal public."BrittoTerminal",
    paid_with_rcc boolean DEFAULT false NOT NULL,
    paid_with_bcc boolean DEFAULT false NOT NULL,
    used_bcc_amount integer,
    rcc_product_submitted boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.rental_requests OWNER TO galib;

--
-- Name: users; Type: TABLE; Schema: public; Owner: galib
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    roll text NOT NULL,
    password text NOT NULL,
    phone_number text,
    selfie text,
    id_card_front text,
    id_card_back text,
    ip_address text,
    latitude numeric(65,30),
    longitude numeric(65,30),
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    is_verified public."VerifyStatus" DEFAULT 'UNVERIFIED'::public."VerifyStatus" NOT NULL,
    brittoo_verified boolean DEFAULT false NOT NULL,
    otp text,
    otp_expiry timestamp(3) without time zone,
    otp_sent_count integer DEFAULT 0 NOT NULL,
    last_otp_sent_date timestamp(3) without time zone,
    security_score public."SecurityScore" DEFAULT 'MID'::public."SecurityScore" NOT NULL,
    is_suspended boolean DEFAULT false NOT NULL,
    suspension_count integer DEFAULT 0 NOT NULL,
    suspension_reason text[] DEFAULT ARRAY[]::text[],
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    is_valid_ruet_mail boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO galib;

--
-- Name: withdrawal_requests; Type: TABLE; Schema: public; Owner: galib
--

CREATE TABLE public.withdrawal_requests (
    id text NOT NULL,
    user_id text NOT NULL,
    wallet_id text NOT NULL,
    bcc_transaction_id text,
    withdraw_amount integer NOT NULL,
    payment_gateway public."PaymentGateway" NOT NULL,
    phone_number text NOT NULL,
    status public."WithdrawalStatus" DEFAULT 'PENDING'::public."WithdrawalStatus" NOT NULL,
    reject_reason text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.withdrawal_requests OWNER TO galib;

--
-- Name: products product_sl_no; Type: DEFAULT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.products ALTER COLUMN product_sl_no SET DEFAULT nextval('public.products_product_sl_no_seq'::regclass);


--
-- Data for Name: SuspensionReason; Type: TABLE DATA; Schema: public; Owner: galib
--

COPY public."SuspensionReason" (id) FROM stdin;
\.


--
-- Data for Name: _ProductsBorrowed; Type: TABLE DATA; Schema: public; Owner: galib
--

COPY public."_ProductsBorrowed" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: galib
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
\.


--
-- Data for Name: bcc_transactions; Type: TABLE DATA; Schema: public; Owner: galib
--

COPY public.bcc_transactions (id, user_id, walllet_id, rental_request_id, amount, payment_gateway, transaction_id, number_used_in_trx, transaction_type, status, reject_reason, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: bcc_wallets; Type: TABLE DATA; Schema: public; Owner: galib
--

COPY public.bcc_wallets (id, user_id, available_balance, locked_balance, requested_for_withdrawal, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: galib
--

COPY public.password_reset_tokens (id, token, user_id, used, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: galib
--

COPY public.products (id, product_sl_no, product_sl, name, price_per_day, product_images, product_type, product_condition, product_age, omv, second_hand_price, tags, product_description, quantity, owner_id, is_on_hold, hold_start_date, hold_end_date, is_for_sale, is_rented, is_brittoo_verified, hold_credit_validity, created_at, updated_at, deleted_at) FROM stdin;
cmdgef1he0001jkvsp7bdmsmi	6	C6	Gloves	29.280000000000000000000000000000	{/uploads/products/product-1753301455677-396393080.png}	CLOTHING	LIKE_NEW	1	1200	1106	gloves	Demo details	1	cmdfxaltw0000jkp25nslc1p8	f	\N	\N	f	f	f	\N	2025-07-23 20:10:55.682	2025-07-23 20:10:55.684	\N
cmdgfgfyu0005jk6kmci6996r	9	B9	The 100$ Startup	4.360000000000000000000000000000	{/uploads/products/product-1753303200654-359505192.jpg,/uploads/products/product-1753303200665-923661316.jpg,/uploads/products/product-1753303200685-146362016.jpg,/uploads/products/product-1753303200713-756351356.jpg}	BOOK	NEW	1	150	141	Book	A very good book for startup enthusiasts. 	1	cmdfy26ik0000jkmni898adv0	f	\N	\N	f	f	f	\N	2025-07-23 20:40:00.727	2025-07-23 20:40:00.729	\N
cmdhr7zk9000ajket1bctpfo3	11	B11	মারহাবা, জাভাস্ক্রিপ্ট এ মারো থাবা।ঝংকার মাহবুব	17.270000000000000000000000000000	{/uploads/products/product-1753383427752-791812574.jpg}	BOOK	LIKE_NEW	1	671	619	book	A very good for Javascript learners and beginners	1	cmdfy26ik0000jkmni898adv0	f	\N	\N	f	f	f	\N	2025-07-24 18:57:07.786	2025-07-24 18:57:07.788	\N
cmdhrghst000ejket3rvqu0yd	12	G12	Fantech Gamepad	25.690000000000000000000000000000	{/uploads/products/product-1753383824652-550968797.jpg,/uploads/products/product-1753383824661-572925907.jpg}	GADGET	GOOD	2	1600	1328	Gadget	Great gamepad 	1	cmdfy26ik0000jkmni898adv0	f	\N	\N	f	f	f	\N	2025-07-24 19:03:44.669	2025-07-24 19:03:44.671	\N
cmdhwhl82000ijketl7cj8j5e	13	O13	Mouse Trap	2.620000000000000000000000000000	{/uploads/products/product-1753392273835-753193717.jpg}	OTHERS	LIKE_NEW	1	100	92	MouseTrap	A good trap to catch mouse	1	cmdfy26ik0000jkmni898adv0	f	\N	\N	f	f	f	\N	2025-07-24 21:24:33.842	2025-07-24 21:24:33.844	\N
cmdhy6ehe000qjketrcoaf2u4	15	M15	Deviser Guitar with electric Output	47.030000000000000000000000000000	{/uploads/products/product-1753395111090-37288059.jpg}	MUSICAL_INSTRUMENT	GOOD	3	12000	9201	Guitar	You can perform stage shows with these guitar.	1	cmdfy26ik0000jkmni898adv0	f	\N	\N	f	f	f	\N	2025-07-24 22:11:51.123	2025-07-24 22:11:51.125	\N
cmdhye8vn000ujketa9frvgdb	16	C16	Football boot	29.280000000000000000000000000000	{/uploads/products/product-1753395477103-803286026.jpg}	CLOTHING	LIKE_NEW	1	1200	1106	Football boot	A very good boot.Size-42.	1	cmdfy26ik0000jkmni898adv0	f	\N	\N	f	f	f	\N	2025-07-24 22:17:57.107	2025-07-24 22:17:57.109	\N
cmdj3v5xo000bjkqkz5in49r0	17	E17	Arduino uno	7.970000000000000000000000000000	{/uploads/products/product-1753465130671-688531947.jpeg,/uploads/products/product-1753465130685-155585293.jpeg}	ELECTRONICS	GOOD	5	800	541	Gadget, electronics, arduino	Good and working 	1	cmdif12sl0006jkqk0q7c5i84	f	\N	\N	f	f	f	\N	2025-07-25 17:38:50.7	2025-07-25 17:38:50.703	\N
cmdj5jdoz0002jkivxnf051fh	18	C18	Boot	31.670000000000000000000000000000	{/uploads/products/product-1753467940111-386308167.jpeg,/uploads/products/product-1753467940111-105688202.jpeg,/uploads/products/product-1753467940112-339252971.jpeg}	CLOTHING	LIKE_NEW	3	2250	1818	boot, shoe, footwear	I bought this product about 3 years ago, but I have used it only once, and still the boot is like new one. 	1	cmdiw5o7c0009jkqkxqf0rbph	f	\N	\N	t	f	f	\N	2025-07-25 18:25:40.116	2025-07-25 18:25:40.118	\N
cmdj70z3a0007jkivy5u830s0	19	G19	ESP32-C3	8.720000000000001000000000000000	{/uploads/products/product-1753470440598-16668333.jpg}	GADGET	NEW	1	300	282	esp32	ESP32-C3 	1	cmdj5008k0000jkiv7kte2koy	f	\N	\N	t	f	f	\N	2025-07-25 19:07:20.615	2025-07-25 19:07:20.616	\N
cmdj76x1d000bjkivrd3hayqh	20	G20	L298D Motor Driver	3.920000000000000000000000000000	{/uploads/products/product-1753470717870-24811832.jpg}	GADGET	GOOD	1	180	158	L298d,motor driver	This L298N Motor Driver Module is a high power motor driver module for driving DC and Stepper Motors. This module consists of an L298 motor driver IC and a 78M05 5V regulator. L298N Module can control up to 4 DC motors, or 2 DC motors with directional and speed control.	1	cmdj5008k0000jkiv7kte2koy	f	\N	\N	t	f	f	\N	2025-07-25 19:11:57.889	2025-07-25 19:11:57.891	\N
cmdj7cyah000fjkivh6ezsnzx	21	G21	Relay module	2.150000000000000000000000000000	{/uploads/products/product-1753470999435-728052023.jpg}	GADGET	NEW	2	90	80	Relay	This small Relay Board works from a 5V signal. It uses a transistor to switch the relay on so can be connected directly to a microcontroller pin.\r\nSwitches up to 10Amps. Rated at up to 250V	1	cmdj5008k0000jkiv7kte2koy	f	\N	\N	t	f	f	\N	2025-07-25 19:16:39.45	2025-07-25 19:16:39.451	\N
cmdjxcea90002jk35dygi4qc1	22	G22	Curren Watch	29.280000000000000000000000000000	{/uploads/products/product-1753514643522-602359242.jpg}	GADGET	LIKE_NEW	1	1200	1106	gadget, watch	Good watch	1	cmdg56bg90000jk4siuc1dxq3	f	\N	\N	f	f	f	\N	2025-07-26 07:24:03.538	2025-07-26 07:33:06.327	\N
cmdvyxwmw0002jkkxvwb0fb59	24	V24	Core Hydro Cycle	39.900000000000000000000000000000	{/uploads/products/product-1754242920787-568863978.jpg,/uploads/products/product-1754242920800-893439083.jpg}	VEHICLE	GOOD	5	14000	9472	Vehicle	A good cycle 	1	cmdfy26ik0000jkmni898adv0	f	\N	\N	f	f	f	\N	2025-08-03 17:42:00.824	2025-08-03 17:42:00.829	\N
cmdwasizq0007jkkx7kxjtz52	25	B25	Fundamental of Computer Algorithms by Ellis(second edition) 	1.030000000000000000000000000000	{/uploads/products/product-1754262825221-35656194.jpg}	BOOK	FAIR	8	200	102	Book	Good book	1	cmdfy26ik0000jkmni898adv0	f	\N	\N	t	f	f	\N	2025-08-03 23:13:45.254	2025-08-03 23:13:45.256	\N
cmdyeqv0i000bjkkx3icmchys	26	G26	Keyboard	22.330000000000000000000000000000	{/uploads/products/product-1754390398290-961158549.jpg}	GADGET	LIKE_NEW	2	1100	962	Keyboard	"Keyboard available for rent – in excellent condition and ready to use. Perfect for temporary needs or events.	1	cmdg56bg90000jk4siuc1dxq3	f	\N	\N	f	f	f	\N	2025-08-05 10:39:58.339	2025-08-05 10:39:58.344	\N
\.


--
-- Data for Name: red_cache_credits; Type: TABLE DATA; Schema: public; Owner: galib
--

COPY public.red_cache_credits (id, amount, in_use, renter_id, user_id, source_product_id, created_at, updated_at, deleted_at) FROM stdin;
cmdgfgfyy0007jk6k442y9uq8	141	0	\N	cmdfy26ik0000jkmni898adv0	cmdgfgfyu0005jk6kmci6996r	2025-07-23 20:40:00.73	2025-07-23 20:40:00.73	\N
cmdhr7zkd000cjketlr6w11si	619	0	\N	cmdfy26ik0000jkmni898adv0	cmdhr7zk9000ajket1bctpfo3	2025-07-24 18:57:07.789	2025-07-24 18:57:07.789	\N
cmdhrghsw000gjkettj40oo20	1328	0	\N	cmdfy26ik0000jkmni898adv0	cmdhrghst000ejket3rvqu0yd	2025-07-24 19:03:44.673	2025-07-24 19:03:44.673	\N
cmdhwhl85000kjket0f9r22hm	92	0	\N	cmdfy26ik0000jkmni898adv0	cmdhwhl82000ijketl7cj8j5e	2025-07-24 21:24:33.845	2025-07-24 21:24:33.845	\N
cmdhy6ehi000sjketnxsawjqm	9201	0	\N	cmdfy26ik0000jkmni898adv0	cmdhy6ehe000qjketrcoaf2u4	2025-07-24 22:11:51.126	2025-07-24 22:11:51.126	\N
cmdhye8vq000wjketq2pr03m5	1106	1106	\N	cmdfy26ik0000jkmni898adv0	cmdhye8vn000ujketa9frvgdb	2025-07-24 22:17:57.11	2025-07-25 04:15:12.143	\N
cmdj3v5xs000djkqk4693l11a	541	0	\N	cmdif12sl0006jkqk0q7c5i84	cmdj3v5xo000bjkqkz5in49r0	2025-07-25 17:38:50.704	2025-07-25 17:38:50.704	\N
cmdj5jdp30004jkivc87tmsi0	1818	0	\N	cmdiw5o7c0009jkqkxqf0rbph	cmdj5jdoz0002jkivxnf051fh	2025-07-25 18:25:40.119	2025-07-25 18:25:40.119	\N
cmdj70z3d0009jkivanjlh224	282	0	\N	cmdj5008k0000jkiv7kte2koy	cmdj70z3a0007jkivy5u830s0	2025-07-25 19:07:20.618	2025-07-25 19:07:20.618	\N
cmdj76x1g000djkivh9q6cc7a	158	0	\N	cmdj5008k0000jkiv7kte2koy	cmdj76x1d000bjkivrd3hayqh	2025-07-25 19:11:57.892	2025-07-25 19:11:57.892	\N
cmdj7cyak000hjkiv8t1eljm6	80	0	\N	cmdj5008k0000jkiv7kte2koy	cmdj7cyah000fjkivh6ezsnzx	2025-07-25 19:16:39.452	2025-07-25 19:16:39.452	\N
cmdjxceac0004jk35rcpzthos	1106	0	\N	cmdg56bg90000jk4siuc1dxq3	cmdjxcea90002jk35dygi4qc1	2025-07-26 07:24:03.541	2025-07-26 07:43:59.958	\N
cmdgef1hg0003jkvsnv420j0r	1106	0	\N	cmdfxaltw0000jkp25nslc1p8	cmdgef1he0001jkvsp7bdmsmi	2025-07-23 20:10:55.685	2025-07-28 06:41:30.392	\N
cmdvyxwn20004jkkxg5g8u55l	9472	0	\N	cmdfy26ik0000jkmni898adv0	cmdvyxwmw0002jkkxvwb0fb59	2025-08-03 17:42:00.83	2025-08-03 17:42:00.83	\N
cmdwasizt0009jkkxnhch5prc	102	0	\N	cmdfy26ik0000jkmni898adv0	cmdwasizq0007jkkx7kxjtz52	2025-08-03 23:13:45.258	2025-08-03 23:13:45.258	\N
cmdyeqv0q000djkkx7quxdz9l	962	0	\N	cmdg56bg90000jk4siuc1dxq3	cmdyeqv0i000bjkkx3icmchys	2025-08-05 10:39:58.347	2025-08-05 10:39:58.347	\N
\.


--
-- Data for Name: rental_request_rcc_usage; Type: TABLE DATA; Schema: public; Owner: galib
--

COPY public.rental_request_rcc_usage (id, rental_request_id, red_cache_credit_id, used_amount, created_at, updated_at) FROM stdin;
cmdib5o9b0004jkqkhslu4h19	cmdib5o960002jkqkv7763vmz	cmdhye8vq000wjketq2pr03m5	1106	2025-07-25 04:15:12.144	2025-07-25 04:15:12.144
cmdjxefmr0008jk35gx9day5w	cmdjxefmm0006jk35aqkx83ja	cmdjxceac0004jk35rcpzthos	1106	2025-07-26 07:25:38.595	2025-07-26 07:25:38.595
cmdjxw6tx000cjk3508he9abv	cmdjxw6tt000ajk35oe69te5k	cmdjxceac0004jk35rcpzthos	1106	2025-07-26 07:39:26.998	2025-07-26 07:39:26.998
cmdjxxpfl000ijk35cy2015b7	cmdjxxpff000ejk35tx8tn5nc	cmdgef1hg0003jkvsnv420j0r	406	2025-07-26 07:40:37.761	2025-07-26 07:40:37.761
\.


--
-- Data for Name: rental_requests; Type: TABLE DATA; Schema: public; Owner: galib
--

COPY public.rental_requests (id, product_id, requester_id, owner_id, bcc_wallet_id, status, reject_reason, brittoo_reject_reason, cancel_reason, submission_deadline, rental_start_date, rental_end_date, total_days, owner_submit_method, renter_collection_method, owner_phone_number, renter_phone_number, renter_delivery_address, pickup_terminal, owner_submit_address, owner_submit_terminal, renter_return_method, renter_return_address, renter_return_terminal, owner_return_receive_method, owner_return_receive_address, owner_return_receive_terminal, paid_with_rcc, paid_with_bcc, used_bcc_amount, rcc_product_submitted, created_at, updated_at, deleted_at) FROM stdin;
cmdgggbel0001jketrjw0x5ri	cmdgef1he0001jkvsp7bdmsmi	cmdfy26ik0000jkmni898adv0	cmdfxaltw0000jkp25nslc1p8	\N	REJECTED_FROM_BRITTOO	\N	this was test demo	\N	2025-07-24 14:00:00	2025-07-24 18:00:00	2025-07-24 18:00:00	1	\N	HOME	\N	+8801860064433	Monafer Mor	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	f	\N	f	2025-07-23 21:07:54.429	2025-07-25 00:05:05.731	\N
cmdib5o960002jkqkv7763vmz	cmdgef1he0001jkvsp7bdmsmi	cmdfy26ik0000jkmni898adv0	cmdfxaltw0000jkp25nslc1p8	\N	REQUESTED_BY_RENTER	\N	\N	\N	2025-07-24 14:00:00	2025-07-24 18:00:00	2025-07-24 18:00:00	1	\N	BRITTOO_TERMINAL	\N	+8800186006443	\N	BANGABANDHU_HALL_1	\N	\N	\N	\N	\N	\N	\N	\N	t	f	\N	f	2025-07-25 04:15:12.138	2025-07-25 04:15:12.138	\N
cmdjxefmm0006jk35aqkx83ja	cmdhye8vn000ujketa9frvgdb	cmdg56bg90000jk4siuc1dxq3	cmdfy26ik0000jkmni898adv0	\N	PRODUCT_RETURNED_TO_OWNER	\N	\N	\N	2025-07-25 14:00:00	2025-07-25 18:00:00	2025-07-27 18:00:00	3	BRITTOO_TERMINAL	BRITTOO_TERMINAL	+8801860064433	+8801850933578	\N	ADMIN_1	\N	CSE_1	\N	\N	\N	\N	\N	\N	t	f	\N	f	2025-07-26 07:25:38.591	2025-07-26 07:34:17.032	\N
cmdjxw6tt000ajk35oe69te5k	cmdhye8vn000ujketa9frvgdb	cmdg56bg90000jk4siuc1dxq3	cmdfy26ik0000jkmni898adv0	\N	REJECTED_BY_OWNER	Ami dhaka asi	\N	\N	2025-07-25 14:00:00	2025-07-25 18:00:00	2025-07-27 18:00:00	3	\N	BRITTOO_TERMINAL	\N	+8801850933578	\N	ADMIN_1	\N	\N	\N	\N	\N	\N	\N	\N	t	f	\N	f	2025-07-26 07:39:26.994	2025-07-26 07:43:59.958	\N
cmdjxxpff000ejk35tx8tn5nc	cmdhye8vn000ujketa9frvgdb	cmdfxaltw0000jkp25nslc1p8	cmdfy26ik0000jkmni898adv0	\N	CANCELLED_BY_RENTER	\N	\N	I don't want it	2025-07-25 14:00:00	2025-07-25 18:00:00	2025-07-27 18:00:00	3	BRITTOO_TERMINAL	BRITTOO_TERMINAL	+8800186006443	+8801772967677	\N	ADMIN_1	\N	ADMIN_1	\N	\N	\N	\N	\N	\N	t	f	\N	f	2025-07-26 07:40:37.755	2025-07-28 06:41:30.392	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: galib
--

COPY public.users (id, name, email, roll, password, phone_number, selfie, id_card_front, id_card_back, ip_address, latitude, longitude, role, email_verified, is_verified, brittoo_verified, otp, otp_expiry, otp_sent_count, last_otp_sent_date, security_score, is_suspended, suspension_count, suspension_reason, created_at, updated_at, deleted_at, is_valid_ruet_mail) FROM stdin;
cmdj7gz0r000ijkivk4syc69f	Rejuan	2010053@student.ruet.ac.bd	2010053	$2b$10$fwTWRK2FwMRVeS89aGTtIegVwFvPXtx0Hh.XTYQBJHDs5AnZGWJU6	\N	\N	\N	\N	103.179.128.5	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-25 19:19:47.018	MID	f	0	{}	2025-07-25 19:19:47.019	2025-07-25 19:25:28.778	\N	t
cmdgc0bmr0007jk4sqdsjmham	123	2010035@student.ruet.ac.bd	2010035	$2b$10$j84SR89pxcKt2QlkrcUDOeVKQg1A.XLmd2pbXpmZ8SexZSSqAbJD2	\N	https://res.cloudinary.com/dt2u8psss/image/upload/v1753297470/brittoo/products/iov6hshofueorfet60bo.jpg	https://res.cloudinary.com/dt2u8psss/image/upload/v1753297469/brittoo/products/g4lxnechki7ys5l5t0xb.jpg	\N	103.60.188.44	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	PENDING	f	\N	\N	0	2025-07-23 19:03:29.763	MID	f	0	{}	2025-07-23 19:03:29.764	2025-07-23 19:04:31.292	\N	t
cmdh739t00008jkethn9t02h2	Labib petuk	abgalib2323@gmail.com	abgalib2323	$2b$10$DfpHGv2SwyE7pBbgs/XDgOT./HHLQJlmCUE4Inx09DvsVA4VLFCTW	\N	\N	\N	\N	27.124.70.144	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	f	UNVERIFIED	f	63694	2025-07-24 09:38:35.459	1	2025-07-24 09:33:35.459	MID	f	0	{}	2025-07-24 09:33:35.46	2025-07-24 09:33:35.46	\N	f
cmdfxaltw0000jkp25nslc1p8	Asadullah Al Galib	2010033@student.ruet.ac.bd	2010033	$2b$10$7ky6T9LuT.agFsl.La3QveDQPopToIBqhqYCoKD5Z7R9ymj5QCmvi	\N	https://res.cloudinary.com/dt2u8psss/image/upload/v1753272738/brittoo/products/qvoli8cy4ixuuzurzvqw.jpg	https://res.cloudinary.com/dt2u8psss/image/upload/v1753272737/brittoo/products/d084xpv9pldn2oybzesw.webp	\N	103.231.163.238	24.364027361817200000000000000000	88.622920263865960000000000000000	ADMIN	t	VERIFIED	f	\N	\N	0	2025-07-23 12:11:35.3	MID	f	0	{}	2025-07-23 12:11:35.301	2025-07-23 12:12:19.271	\N	t
cmdj6c7yv0005jkivlao4soc7	Droha deb	2010038@student.ruet.ac.bd	2010038	$2b$10$JIyRxypQa7KPGQLm7wRa3OGlKt8Jaw./eEc2fRDlEoW89pXQ.lPDu	\N	/uploads/selfie-1753469405853-31386177.jpg	/uploads/id-card-1753469405852-398699439.jpg	\N	103.126.36.4	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-25 18:48:05.718	MID	f	0	{}	2025-07-25 18:48:05.719	2025-07-25 18:58:38.113	\N	t
cmdg0u0890000jkvog0kn6nuh	Test	aagalib2323@gmail.com	aagalib2323	$2b$10$ZA5UeJo1CU398bRT.dZ/Pe6cd/QJTKNPp91QaS/GYp12Tby3Lfzau	\N	https://res.cloudinary.com/dt2u8psss/image/upload/v1753278684/brittoo/products/eimdu584cihxanjbgbbj.jpg	https://res.cloudinary.com/dt2u8psss/image/upload/v1753278683/brittoo/products/e9f58yx4nixypaht0k8q.jpg	\N	103.231.163.239	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	PENDING	f	\N	\N	0	2025-07-23 13:50:39.273	MID	f	0	{}	2025-07-23 13:50:39.273	2025-07-23 13:51:25.021	\N	f
cmdg56bg90000jk4siuc1dxq3	Promi	2010031@student.ruet.ac.bd	2010031	$2b$10$zkFDoljzuFqJbKKMyOUoq.wYO73MMViYw/QYU53hf73efiQ1gZ62G	\N	https://res.cloudinary.com/dt2u8psss/image/upload/v1753286063/brittoo/products/xbkjwy4d63jrrdk723mo.jpg	https://res.cloudinary.com/dt2u8psss/image/upload/v1753286063/brittoo/products/xei3jwh7ciyi3ns3bqej.jpg	\N	103.126.36.5	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-23 15:52:12.153	MID	f	0	{}	2025-07-23 15:52:12.154	2025-07-23 15:55:21.871	\N	t
cmdgbfedw0005jk4si6om4kfa	Jwhwb	nay@gmail.com	nay	$2b$10$WWFrnJFLaXWdoj7N99WmX.ajRcXVB5iamV/1GfxPJTiPyEgPa4Zlu	\N	\N	\N	\N	103.60.188.44	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	f	UNVERIFIED	f	78670	2025-07-23 18:52:13.556	1	2025-07-23 18:47:13.556	MID	f	0	{}	2025-07-23 18:47:13.557	2025-07-23 18:47:13.557	\N	f
cmdfy26ik0000jkmni898adv0	Durjoy Saha	2010011@student.ruet.ac.bd	2010011	$2b$10$b4At/aYgZTR9R65buZOrLeE5iEUc58F2BL3PiEqjtKXI/emettEm.	\N	https://res.cloudinary.com/dt2u8psss/image/upload/v1753274085/brittoo/products/mthjf7zixl8ypf2eedpe.jpg	https://res.cloudinary.com/dt2u8psss/image/upload/v1753274084/brittoo/products/k6opfhb9l0dlfs2v19t0.jpg	\N	118.179.196.65	24.366061200000000000000000000000	88.623455600000000000000000000000	ADMIN	t	VERIFIED	f	\N	\N	0	2025-07-23 12:33:01.82	MID	f	0	{}	2025-07-23 12:33:01.821	2025-07-23 13:00:57.022	\N	t
cmdiat6820000jkqkncmh1l1y	Rahul	2010001@student.ruet.ac.bd	2010001	$2b$10$8aX2p5Ef54DXcXMqTzKqcOnRBhACR8AlNyU9IDsauwOQSQbZ8tDw2	\N	\N	\N	\N	118.179.126.161	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	f	VERIFIED	f	16445	2025-07-25 04:10:28.897	1	2025-07-25 04:05:28.897	MID	f	0	{}	2025-07-25 04:05:28.898	2025-07-25 17:57:14.201	\N	t
cmdik0my10008jkqkf28pn1mh	Ridwan kader 	2008059@student.ruet.ac.bd	2008059	$2b$10$tGzwErEegMLAnB6CgA/NUeO8nFVLG4lLlvqX8tBztbMpY7DKLM5fC	\N	\N	\N	\N	103.231.163.239	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-25 08:23:13.704	MID	f	0	{}	2025-07-25 08:23:13.705	2025-07-25 18:03:38.23	\N	t
cmdj5008k0000jkiv7kte2koy	Nazmul Haque Naqib	2010029@student.ruet.ac.bd	2010029	$2b$10$V0RQoRaEB43qWG6BXd9RV.ZFK.MI1MTxowR4hnvXaaU3RLx/QiPV6	\N	/uploads/selfie-1753467302060-910775189.jpg	/uploads/id-card-1753467302060-659195228.jpg	\N	118.179.115.209	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-25 18:10:36.212	MID	f	0	{}	2025-07-25 18:10:36.213	2025-07-25 18:39:11.278	\N	t
cmdiggpx60007jkqkc6n2n5jf	Rifath	2010014@student.ruet.ac.bd	2010014	$2b$10$hgE9ERz3auIx298NCdVuxu8.oJsP11N20YQQHjgBbZLjWL20CCr/K	\N	\N	\N	\N	103.121.62.115	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-25 06:43:45.594	MID	f	0	{}	2025-07-25 06:43:45.595	2025-07-25 18:05:35.905	\N	t
cmdiw5o7c0009jkqkxqf0rbph	MD. MAHFUZUL ALAM 	2010030@student.ruet.ac.bd	2010030	$2b$10$1Xi1dlYPakXObhJkl/Rs1emarMkmw1tAMMRGsn2f/cNNSjql0mFHW	\N	/uploads/selfie-1753455769112-106319188.jpg	/uploads/id-card-1753455769111-795898236.jpg	\N	103.230.106.4	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	f	VERIFIED	f	23598	2025-07-25 14:14:24.288	2	2025-07-25 14:09:24.288	MID	f	0	{}	2025-07-25 14:03:04.009	2025-07-25 17:33:59.572	\N	t
cmdif12sl0006jkqk0q7c5i84	Adib	2210011@student.ruet.ac.bd	2210011	$2b$10$1fM6I3R5bR/yGek0LwizQOEecbi8lg1MOVPpeG32Y3aZYVUfwf.Ga	\N	/uploads/selfie-1753423748884-976164505.jpg	/uploads/id-card-1753423748874-538791669.jpg	\N	43.245.122.66	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-25 06:03:36.165	MID	f	0	{}	2025-07-25 06:03:36.165	2025-07-25 17:34:32.592	\N	t
cmdibeoi10005jkqk8jdbulqy	Khondokar Radwanur Rahman 	2010020@student.ruet.ac.bd	2010020	$2b$10$NIqU/hKIcOUizJCORzmdK.fgQ8M8Y4cQh/GK4xKIHT8L4JZDXlolW	\N	/uploads/selfie-1753417479901-363204863.jpg	/uploads/id-card-1753417479900-860376947.jpg	\N	103.91.231.234	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-25 04:22:12.36	MID	f	0	{}	2025-07-25 04:22:12.361	2025-07-25 17:34:55.367	\N	t
cmdgbg0x40006jk4ssfq08wy2	Prapty 	nabilaferdousprapty@gmail.com	nabilaferdousprapty	$2b$10$mZBYaA1Evw5wX0NpOJCuL.er2itRroraYDiNa7I.i7Jw8c.3JtBly	\N	https://res.cloudinary.com/dt2u8psss/image/upload/v1753296745/brittoo/products/pjl8og8xnesg03ab6adw.jpg	https://res.cloudinary.com/dt2u8psss/image/upload/v1753296744/brittoo/products/ij8wwmvr4ekji2neoicu.jpg	\N	103.60.188.44	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-23 18:47:42.759	MID	f	0	{}	2025-07-23 18:47:42.76	2025-07-25 18:05:54.881	\N	f
cmdj8ta3t000kjkivdyf5wxtz	Md. Fojle Rabbi 	2010039@student.ruet.ac.bd	2010039	$2b$10$L3S8H.h5wFwdOGxrqX6E7eTDtRdZwWbXWKmfBvi4mQdPc9c7Ah1ue	\N	/uploads/selfie-1753473514572-115761129.jpg	/uploads/id-card-1753473514570-468114558.jpg	\N	123.136.29.128	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-25 19:57:20.872	MID	f	0	{}	2025-07-25 19:57:20.873	2025-07-25 20:01:56.327	\N	t
cmdj8pj5a000jjkivyioxvo84	Shahriar Abdur Rahman	2010008@student.ruet.ac.bd	2010008	$2b$10$QYZl5igB/Gt6PpNyg.PNReLGcVUZf0e3QTDuaueSwHQKYqOxlITve	\N	/uploads/selfie-1753473429746-977319237.jpg	/uploads/id-card-1753473429745-374666131.jpg	\N	103.179.128.54	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-25 19:54:25.965	MID	f	0	{}	2025-07-25 19:54:25.966	2025-07-25 20:01:42.138	\N	t
cmdj9hfh0000ljkivww6yssa8	Md.Tanjim Jahan 	2010007@student.ruet.ac.bd	2010007	$2b$10$S6FJD7HDRnU4cnkxjWd4AOcxLoucbUkMmEDU.AOM5lVM0IiqdkaDK	\N	\N	\N	\N	103.126.36.2	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-25 20:16:07.571	MID	f	0	{}	2025-07-25 20:16:07.572	2025-07-25 20:37:00.033	\N	t
cmdjot1tn0000jk35zkuvq8i3	MD. Ashikul Islam	2010019@student.ruet.ac.bd	2010019	$2b$10$VLlcWA4f5ppenEJD50y/pOFy6y1RmLB3qdxz1PrL43gfV7EiPu7eq	\N	/uploads/selfie-1753501466125-484061319.jpg	/uploads/id-card-1753501466101-919997761.jpg	\N	103.179.128.21	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-26 03:25:03.995	MID	f	0	{}	2025-07-26 03:25:03.996	2025-07-26 05:54:11.136	\N	t
cmdvwevsv0000jkkxlaoi609x	Numan Zaman Dipu	2102115@student.ruet.ac.bd	2102115	$2b$10$yi/8LgNM3KCkmLUYUGM2o.QekI1RzjcMV/Dl1n49Iv2CHY8dNE1HC	\N	/uploads/selfie-1754238789588-662414249.jpg	/uploads/id-card-1754238789588-150964785.jpg	\N	103.126.36.4	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-08-03 16:31:14.043	MID	f	0	{}	2025-08-03 16:31:14.045	2025-08-03 16:53:26.6	\N	t
cmdk61z88000jjk359krcdwme	Haa-meem Al Hamra	2010060@student.ruet.ac.bd	2010060	$2b$10$h5Xc/VW0RU98qy1yqNbSuu8Oz9r8eo0HFIRoHO3WlUiVBf5j/tSEK	\N	/uploads/selfie-1753529712140-990098744.jpg	/uploads/id-card-1753529712134-844831370.jpg	\N	103.179.128.116	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-26 11:27:54.007	MID	f	0	{}	2025-07-26 11:27:54.008	2025-07-26 14:03:00.948	\N	t
cmdnhfyu30002jk8nhsloxlxk	AMS MUHITU	amuhitu0@gmail.com	amuhitu0	$2b$10$/UUJEY58pyVNmgBRRmCVD.Ox05tNh6o1DlY2yaQaMgggF.19sUHNq	\N	/uploads/selfie-1753729899750-572904538.jpg	/uploads/id-card-1753729899750-213119792.jpg	\N	103.179.128.41	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-28 19:10:00.986	MID	f	0	{}	2025-07-28 19:10:00.987	2025-07-28 19:15:48.939	\N	f
cmdkfycdd000kjk351uqddgdu	Miftahul JannatNabil	2108021@student.ruet.ac.bd	2108021	$2b$10$79VvXAFjglBETApGKGeRqeuvOSr2Fk/X5jrhGocTorgn3Fxwtvf.u	\N	/uploads/selfie-1753546048558-834994253.jpg	/uploads/id-card-1753546048557-832783059.jpg	\N	118.179.196.65	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-26 16:05:00.576	MID	f	0	{}	2025-07-26 16:05:00.577	2025-07-26 17:03:31.101	\N	t
cmdkk1jmg000ljk35g56eh6ew	Zubayer Jahin	2110006@student.ruet.ac.bd	2110006	$2b$10$xW6dMXTnqBAbeZIp8TeQ0.09NWGU9YKf5Aj96X0agopVyg5pOjeM6	\N	\N	\N	\N	103.230.107.51	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-26 17:59:28.408	MID	f	0	{}	2025-07-26 17:59:28.408	2025-07-26 18:09:51.92	\N	t
cmdldso94000mjk35uwl0dw0x	Toufiq	2010043@student.ruet.ac.bd	2010043	$2b$10$glWr1MUntOvnOLtXF/0nGOd5WBAGsKEfuu9IDsewQ2lzoCAwT4Qri	\N	\N	\N	\N	103.126.36.2	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	f	UNVERIFIED	f	77584	2025-07-27 07:57:22.984	1	2025-07-27 07:52:22.984	MID	f	0	{}	2025-07-27 07:52:22.985	2025-07-27 07:52:22.985	\N	t
cmdw65gbr0005jkkx1ziepycy	Md. Naim	2202107@student.ruet.ac.bd	2202107	$2b$10$ucnxpFfRBMGbpuQGk8eMNeU26A8XPfUCfogID4gYDd3RwlFQ41m0S	\N	\N	\N	\N	118.179.196.65	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-08-03 21:03:50.246	MID	f	0	{}	2025-08-03 21:03:50.247	2025-08-03 21:50:54.949	\N	t
cmdldt51q000njk35gwnrew15	Toufiq	2010054@student.ruet.ac.bd	2010054	$2b$10$PuQK3s/EswQggDkaWwmfP.wPkXTOCs4jKpObiv3wSQe7Ktun/wGky	\N	\N	\N	\N	103.126.36.2	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-27 07:52:44.749	MID	f	0	{}	2025-07-27 07:52:44.75	2025-07-27 07:55:59.162	\N	t
cmdoveh270003jk8nuk7ulmnu	Anik Kumar	2001056@student.ruet.ac.bd	2001056	$2b$10$8teqwZrUFKSkyO45sCvbHOykw4pC3bXsZ2RpO5HfpueIyUWSkmXIO	\N	/uploads/selfie-1753813873128-726500456.jpg	/uploads/id-card-1753813873128-850808721.jpg	\N	103.230.107.15	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-29 18:28:32.094	MID	f	0	{}	2025-07-29 18:28:32.095	2025-07-29 18:37:25.458	\N	t
cmdmst5ou0000jk8nwly939dk	Md. Isteak Ahmed Shajal	2103138@student.ruet.ac.bd	2103138	$2b$10$zyQsj9XN8upBXmxflcM.m.PexjK7j7wfXel/0gcGZJ.A.1zpiroMS	\N	\N	\N	\N	118.179.196.65	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-28 07:40:25.998	MID	f	0	{}	2025-07-28 07:40:25.999	2025-07-28 10:11:55.494	\N	t
cmdmumbxe0001jk8n6dq6wzga	Bijoy Bhowmick	2101130@student.ruet.ac.bd	2101130	$2b$10$47AP4NGXD2QJmwO1EtqHIO/1Q8XJGT.7t.jNDLtLvlPI7KL7708ee	\N	\N	\N	\N	103.230.105.33	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-28 08:31:06.722	MID	f	0	{}	2025-07-28 08:31:06.722	2025-07-28 10:12:14.637	\N	t
cmdpjd1uv0004jk8n92wdtkiv	MD AHOSANUL HUQ MILON	2010048@student.ruet.ac.bd	2010048	$2b$10$WIeuwW0FAJ7/A0raqoFTG.CraEhLND5ISmRn4D9e91FW8DZRl9uIm	\N	/uploads/selfie-1753854032221-774205963.jpg	/uploads/id-card-1753854032221-556825719.jpg	\N	37.111.229.117	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-07-30 05:39:16.518	MID	f	0	{}	2025-07-30 05:39:16.519	2025-07-30 05:41:47.532	\N	t
cme1u2kbu000ejkkxbn3h0r94	Abeer Shahriar	2013041@student.ruet.ac.bd	2013041	$2b$10$pw7qRCd5FK7pt3lCI4syv.oYMxD6jIX1cahkpVEPSdvBGzSZN/Jf2	\N	\N	\N	\N	103.126.61.0	33.330000000000000000000000000000	33.330000000000000000000000000000	USER	t	VERIFIED	f	\N	\N	0	2025-08-07 20:12:17.126	MID	f	0	{}	2025-08-07 20:12:17.129	2025-08-08 09:48:50.117	\N	t
\.


--
-- Data for Name: withdrawal_requests; Type: TABLE DATA; Schema: public; Owner: galib
--

COPY public.withdrawal_requests (id, user_id, wallet_id, bcc_transaction_id, withdraw_amount, payment_gateway, phone_number, status, reject_reason, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Name: products_product_sl_no_seq; Type: SEQUENCE SET; Schema: public; Owner: galib
--

SELECT pg_catalog.setval('public.products_product_sl_no_seq', 26, true);


--
-- Name: SuspensionReason SuspensionReason_pkey; Type: CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public."SuspensionReason"
    ADD CONSTRAINT "SuspensionReason_pkey" PRIMARY KEY (id);


--
-- Name: _ProductsBorrowed _ProductsBorrowed_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public."_ProductsBorrowed"
    ADD CONSTRAINT "_ProductsBorrowed_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: bcc_transactions bcc_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.bcc_transactions
    ADD CONSTRAINT bcc_transactions_pkey PRIMARY KEY (id);


--
-- Name: bcc_wallets bcc_wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.bcc_wallets
    ADD CONSTRAINT bcc_wallets_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: red_cache_credits red_cache_credits_pkey; Type: CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.red_cache_credits
    ADD CONSTRAINT red_cache_credits_pkey PRIMARY KEY (id);


--
-- Name: rental_request_rcc_usage rental_request_rcc_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.rental_request_rcc_usage
    ADD CONSTRAINT rental_request_rcc_usage_pkey PRIMARY KEY (id);


--
-- Name: rental_requests rental_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.rental_requests
    ADD CONSTRAINT rental_requests_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: withdrawal_requests withdrawal_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_pkey PRIMARY KEY (id);


--
-- Name: _ProductsBorrowed_B_index; Type: INDEX; Schema: public; Owner: galib
--

CREATE INDEX "_ProductsBorrowed_B_index" ON public."_ProductsBorrowed" USING btree ("B");


--
-- Name: bcc_wallets_user_id_key; Type: INDEX; Schema: public; Owner: galib
--

CREATE UNIQUE INDEX bcc_wallets_user_id_key ON public.bcc_wallets USING btree (user_id);


--
-- Name: password_reset_tokens_token_key; Type: INDEX; Schema: public; Owner: galib
--

CREATE UNIQUE INDEX password_reset_tokens_token_key ON public.password_reset_tokens USING btree (token);


--
-- Name: password_reset_tokens_user_id_key; Type: INDEX; Schema: public; Owner: galib
--

CREATE UNIQUE INDEX password_reset_tokens_user_id_key ON public.password_reset_tokens USING btree (user_id);


--
-- Name: products_owner_id_product_sl_key; Type: INDEX; Schema: public; Owner: galib
--

CREATE UNIQUE INDEX products_owner_id_product_sl_key ON public.products USING btree (owner_id, product_sl);


--
-- Name: products_product_sl_key; Type: INDEX; Schema: public; Owner: galib
--

CREATE UNIQUE INDEX products_product_sl_key ON public.products USING btree (product_sl);


--
-- Name: products_product_sl_no_deleted_at_key; Type: INDEX; Schema: public; Owner: galib
--

CREATE UNIQUE INDEX products_product_sl_no_deleted_at_key ON public.products USING btree (product_sl_no, deleted_at);


--
-- Name: red_cache_credits_source_product_id_key; Type: INDEX; Schema: public; Owner: galib
--

CREATE UNIQUE INDEX red_cache_credits_source_product_id_key ON public.red_cache_credits USING btree (source_product_id);


--
-- Name: rental_request_rcc_usage_rental_request_id_red_cache_credit_key; Type: INDEX; Schema: public; Owner: galib
--

CREATE UNIQUE INDEX rental_request_rcc_usage_rental_request_id_red_cache_credit_key ON public.rental_request_rcc_usage USING btree (rental_request_id, red_cache_credit_id);


--
-- Name: rental_requests_owner_id_status_idx; Type: INDEX; Schema: public; Owner: galib
--

CREATE INDEX rental_requests_owner_id_status_idx ON public.rental_requests USING btree (owner_id, status);


--
-- Name: rental_requests_product_id_status_idx; Type: INDEX; Schema: public; Owner: galib
--

CREATE INDEX rental_requests_product_id_status_idx ON public.rental_requests USING btree (product_id, status);


--
-- Name: users_email_deleted_at_key; Type: INDEX; Schema: public; Owner: galib
--

CREATE UNIQUE INDEX users_email_deleted_at_key ON public.users USING btree (email, deleted_at);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: galib
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_latitude_longitude_idx; Type: INDEX; Schema: public; Owner: galib
--

CREATE INDEX users_latitude_longitude_idx ON public.users USING btree (latitude, longitude);


--
-- Name: users_phone_number_deleted_at_key; Type: INDEX; Schema: public; Owner: galib
--

CREATE UNIQUE INDEX users_phone_number_deleted_at_key ON public.users USING btree (phone_number, deleted_at);


--
-- Name: users_roll_deleted_at_key; Type: INDEX; Schema: public; Owner: galib
--

CREATE UNIQUE INDEX users_roll_deleted_at_key ON public.users USING btree (roll, deleted_at);


--
-- Name: users_roll_key; Type: INDEX; Schema: public; Owner: galib
--

CREATE UNIQUE INDEX users_roll_key ON public.users USING btree (roll);


--
-- Name: withdrawal_requests_bcc_transaction_id_key; Type: INDEX; Schema: public; Owner: galib
--

CREATE UNIQUE INDEX withdrawal_requests_bcc_transaction_id_key ON public.withdrawal_requests USING btree (bcc_transaction_id);


--
-- Name: _ProductsBorrowed _ProductsBorrowed_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public."_ProductsBorrowed"
    ADD CONSTRAINT "_ProductsBorrowed_A_fkey" FOREIGN KEY ("A") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProductsBorrowed _ProductsBorrowed_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public."_ProductsBorrowed"
    ADD CONSTRAINT "_ProductsBorrowed_B_fkey" FOREIGN KEY ("B") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bcc_transactions bcc_transactions_rental_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.bcc_transactions
    ADD CONSTRAINT bcc_transactions_rental_request_id_fkey FOREIGN KEY (rental_request_id) REFERENCES public.rental_requests(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bcc_transactions bcc_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.bcc_transactions
    ADD CONSTRAINT bcc_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bcc_transactions bcc_transactions_walllet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.bcc_transactions
    ADD CONSTRAINT bcc_transactions_walllet_id_fkey FOREIGN KEY (walllet_id) REFERENCES public.bcc_wallets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bcc_wallets bcc_wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.bcc_wallets
    ADD CONSTRAINT bcc_wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: products products_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: red_cache_credits red_cache_credits_source_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.red_cache_credits
    ADD CONSTRAINT red_cache_credits_source_product_id_fkey FOREIGN KEY (source_product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: red_cache_credits red_cache_credits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.red_cache_credits
    ADD CONSTRAINT red_cache_credits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rental_request_rcc_usage rental_request_rcc_usage_red_cache_credit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.rental_request_rcc_usage
    ADD CONSTRAINT rental_request_rcc_usage_red_cache_credit_id_fkey FOREIGN KEY (red_cache_credit_id) REFERENCES public.red_cache_credits(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: rental_request_rcc_usage rental_request_rcc_usage_rental_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.rental_request_rcc_usage
    ADD CONSTRAINT rental_request_rcc_usage_rental_request_id_fkey FOREIGN KEY (rental_request_id) REFERENCES public.rental_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: rental_requests rental_requests_bcc_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.rental_requests
    ADD CONSTRAINT rental_requests_bcc_wallet_id_fkey FOREIGN KEY (bcc_wallet_id) REFERENCES public.bcc_wallets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: rental_requests rental_requests_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.rental_requests
    ADD CONSTRAINT rental_requests_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rental_requests rental_requests_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.rental_requests
    ADD CONSTRAINT rental_requests_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rental_requests rental_requests_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.rental_requests
    ADD CONSTRAINT rental_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: withdrawal_requests withdrawal_requests_bcc_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_bcc_transaction_id_fkey FOREIGN KEY (bcc_transaction_id) REFERENCES public.bcc_transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: withdrawal_requests withdrawal_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: withdrawal_requests withdrawal_requests_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: galib
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.bcc_wallets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO galib;


--
-- PostgreSQL database dump complete
--

