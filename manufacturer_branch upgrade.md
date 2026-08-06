# Manufacturer-Friendly Branch Structure

This document captures the proposed upgrade to the branch module so it can support manufacturing businesses.

## 1. Final Recommendation

The branch module should be transformed from a retail outlet feature into a manufacturing site / operating location feature.

## 2. New Branch Purpose

A branch should represent a physical or operational site such as:

- factory
- warehouse
- production unit
- storage location
- dispatch center

## 3. Branch Type

Each branch should have a type such as:

- production
- storage
- distribution
- mixed

## 4. Branch Role

Each branch should define its role in the manufacturing flow:

- raw material storage
- WIP handling
- finished goods storage
- dispatch / sales outlet
- mixed operations

## 5. Inventory Ownership by Branch

The branch should be able to track and manage:

- raw materials
- work in progress
- finished goods

## 6. Movement Operations Supported by Branch

The branch should support:

- receiving stock
- issuing to production
- transfers between branches
- dispatch to customers
- losses, damage, and adjustments

## 7. Production Integration

The branch should be linked to:

- production orders
- BOM consumption
- batch / lot records
- stock transfers
- dispatch records

## 8. Updated Branch Overview

Instead of focusing mainly on sales, the branch dashboard should show:

- raw material balance
- WIP balance
- finished goods balance
- active production
- transfers
- dispatches
- low stock alerts

## 9. Implementation Direction

The existing branch concept can be kept, but its meaning should be expanded.

Recommended approach:

- keep the shared branch model
- add manufacturing-specific capabilities
- use branch as a site-level operational unit
- make it the center of inventory, production, and dispatch activities

## 10. Final Conclusion

The new branch structure should be:

- one shared branch model
- with manufacturing-specific capabilities
- used as an operational site for inventory, production, and dispatch rather than only sales
