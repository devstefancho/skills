# Referral Reward

## Purpose

Reward existing users with credit when a friend they invited completes a first purchase, to drive organic growth.

## Requirements

- Each user has a unique referral code shareable as a link
- When an invited friend signs up via the link and completes their first purchase, both sides receive 5,000 KRW credit
- Credit is granted at most once per invited friend; self-referral is rejected
- Reward grant is delayed 7 days after the purchase to absorb refunds — a refund within the window cancels the reward

## Approach

Referral attribution is stored at signup time by resolving the code in the invite link. Reward granting runs as a scheduled job that scans purchases older than 7 days with pending referral rewards, skipping refunded orders. Credits are issued through the existing wallet service.

## Verification

- Invited signup followed by first purchase creates a pending reward for both users
- Refund within 7 days cancels the pending reward
- Self-referral and second purchases grant nothing
