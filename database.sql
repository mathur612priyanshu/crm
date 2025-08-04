-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 28, 2025 at 03:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `capitalcaredb`
--

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `emp_id` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `ename` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`emp_id`, `email`, `phone`, `username`, `ename`, `password`) VALUES
('CCARE201', 'rajputhimanshusingh2002@gmail.com', '9161735718', 'CCARE201', 'Himanshu', '17605293'),
('CCARE202', 'mathur612priyanshu@gmail.com', '9411619711', 'CCARE202', 'Priyanshu Mathur', '10307596');

-- --------------------------------------------------------

--
-- Table structure for table `histories`
--

CREATE TABLE `histories` (
  `history_id` int(11) NOT NULL,
  `lead_id` int(11) NOT NULL,
  `owner` varchar(255) DEFAULT NULL,
  `next_meeting` datetime DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `histories`
--

INSERT INTO `histories` (`history_id`, `lead_id`, `owner`, `next_meeting`, `status`, `remark`, `createdAt`, `updatedAt`) VALUES
(1, 2, 'John Doe', NULL, 'Follow-up', 'Customer interested in home loan, follow-up scheduled.', '2025-05-27 19:08:18', '2025-05-27 19:08:18'),
(2, 1, 'Priyanshu Mathur', '2025-05-31 05:30:00', 'No Requirement', 'rem', '2025-05-27 19:11:32', '2025-05-27 19:11:32'),
(4, 1, 'Priyanshu Mathur', '2025-05-30 05:30:00', 'Interested', '7j7jn7', '2025-05-28 12:09:51', '2025-05-28 12:09:51'),
(5, 6, 'Priyanshu Mathur', '2025-05-28 05:30:00', 'No Requirement', ' hu. ', '2025-05-28 13:31:29', '2025-05-28 13:31:29'),
(6, 1, 'Priyanshu Mathur', '2025-05-31 05:30:00', 'Interested', '', '2025-05-28 13:32:21', '2025-05-28 13:32:21'),
(7, 7, 'Priyanshu Mathur', '2025-05-28 05:30:00', 'Documents Summited', NULL, '2025-05-28 13:37:12', '2025-05-28 13:37:12'),
(8, 8, 'Priyanshu Mathur', '2025-05-30 05:30:00', 'Documents Summited', NULL, '2025-05-28 13:45:34', '2025-05-28 13:45:34'),
(9, 11, 'Priyanshu Mathur', '2025-05-23 05:30:00', 'Documents Summited', NULL, '2025-05-28 13:48:40', '2025-05-28 13:48:40');

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `lead_id` int(11) NOT NULL,
  `person_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `number` varchar(255) NOT NULL,
  `email` text DEFAULT NULL,
  `owner` varchar(255) DEFAULT NULL,
  `branch` varchar(255) DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `priority` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `next_meeting` datetime DEFAULT NULL,
  `refrence` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `loan_type` text DEFAULT NULL,
  `est_budget` varchar(255) DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`lead_id`, `person_id`, `name`, `number`, `email`, `owner`, `branch`, `source`, `priority`, `status`, `next_meeting`, `refrence`, `description`, `address`, `loan_type`, `est_budget`, `remark`, `createdAt`, `updatedAt`) VALUES
(1, 'CCARE202', 'Eve Blue', '123', 'mathur@gmail.com', 'Priyanshu Mathur', '', 'LinkedIn', 'Important', 'Interested', '2025-05-31 05:30:00', 'Old Client', 'Looking for business expansion loan', 'Agra loha mandi', 'Business Loan', '', '', '2025-05-26 16:26:35', '2025-05-28 13:32:21'),
(2, 'CCARE202', 'ceuev', '7659', 'gshycg', 'Priyanshu Mathur', '', 'Website', 'High Priority and Important', 'Follow up', '2025-05-26 05:30:00', 'bridge di', 'nsbdud d', 'bz8svsudve', 'Mortgage Loan', NULL, NULL, '2025-05-26 16:38:52', '2025-05-26 16:38:52'),
(4, 'CCARE202', 'Eve Blue', '9876543266', 'mathur@gmail.com', 'Sunil', 'Hyderabad', 'LinkedIn', 'Low', 'Contacted', '2025-06-05 10:00:00', 'Old Client', 'Looking for business expansion loan', 'Agra loha mandi', 'Business Loan', NULL, NULL, '2025-05-27 11:39:08', '2025-05-27 11:39:08'),
(5, 'CCARE202', 'yvvvyvv6v', '882888', 't. tv', 'Priyanshu Mathur', '', 'Newspaper', 'Important', 'Loan Section', '2025-05-29 05:30:00', ' g. y\n', 'g g. ', 'g. g vy bbybvtvtvyvm', 'User Car Loan', NULL, NULL, '2025-05-27 12:20:09', '2025-05-27 12:20:09'),
(6, 'CCARE202', 'uehwu', '3446', 'vsusv', 'Priyanshu Mathur', 'Default', 'Website', 'Lower', 'No Requirement', '2025-05-28 05:30:00', 'bsbs', '', '', '', '9969', ' hu. ', '2025-05-27 15:00:15', '2025-05-28 13:31:29'),
(7, 'CCARE202', 'vsjsv', '97648', 'vsjsv', 'Priyanshu Mathur', 'Default', 'Newspaper', 'Important', 'Document Rejected', '2025-05-22 05:30:00', 'vsjd ', 'vudv', 'bsidv', 'Mortgage Loan', NULL, NULL, '2025-05-28 13:29:39', '2025-05-28 13:29:39'),
(8, 'CCARE202', 'beuev', '65348', 'hsuvd', 'Priyanshu Mathur', 'Default', 'Website', 'Mid', 'Documents Summited', '2025-05-28 05:30:00', 'h', 'jjsj', 'bsubd', 'User Car Loan', NULL, NULL, '2025-05-28 13:37:12', '2025-05-28 13:37:12'),
(9, 'CCARE202', 'heye', '4649', 'shsv', 'Priyanshu Mathur', 'Default', 'Refrence', 'High Priority and Important', 'Documents Summited', '2025-05-30 05:30:00', 'bsbs', 'hsusv', 'hsdb', 'Personal Loan', NULL, NULL, '2025-05-28 13:45:34', '2025-05-28 13:45:34'),
(10, 'CCARE202', 'heusb', '97979', 'hshdh', 'Priyanshu Mathur', '', 'Newspaper', 'Important', 'Documents Summited', '2025-05-28 05:30:00', 'bub', 'bub', 'bhv', '', NULL, NULL, '2025-05-28 13:47:09', '2025-05-28 13:47:09'),
(11, 'CCARE202', 'ge7ge', '98359', '7dveusv', 'Priyanshu Mathur', '', 'Website', 'High Priority and Important', 'Documents Summited', '2025-05-23 05:30:00', 'vuvh', 'bhvh', 'vhbh', '', NULL, NULL, '2025-05-28 13:48:40', '2025-05-28 13:48:40');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`emp_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `histories`
--
ALTER TABLE `histories`
  ADD PRIMARY KEY (`history_id`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`lead_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `histories`
--
ALTER TABLE `histories`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `lead_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
