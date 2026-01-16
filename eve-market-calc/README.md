# EVE Jita Trade Scanner

Small Python script to scan ESI market data for trade opportunities starting from a chosen system (default: Jita).
It looks for items you can buy in Jita and sell within a jump range (instant sell to buy orders, or list-to-sell via sell orders).

## Quick start

```bash
python3 market_scan.py --budget 10000000 --max-jumps 10 --sample-size 150
```

Example with a different start system:

```bash
python3 market_scan.py --start-system Amarr --budget 10000000 --max-jumps 10
```

Outputs:
- JSON: `data/scan_latest.json`
- CSV: `data/scan_latest.csv`

## Notes

- The scanner samples items by default to keep runtime reasonable.
- Results include estimated profit after optional fees (sales tax + broker fee).
- Increase `--sample-size` and `--order-pages` for more thorough scans.
- First run can take a while because it builds a nearby-systems cache; later runs reuse `data/nearby_systems.json`.

## Useful options

```bash
# more thorough scan
python3 market_scan.py --budget 10000000 --max-jumps 10 --sample-size 400 --order-pages 0

# instant-only, high-sec, slightly higher margin filter
python3 market_scan.py --mode instant --min-margin-pct 12 --min-security 0.5

# list-only and ignore fees (raw spreads)
python3 market_scan.py --mode list --tax-pct 0 --broker-pct 0
```

## Files

- `market_scan.py`: main script
- `data/esi_cache.json`: cached ESI universe data
- `data/types_region.json`: cached market types for the start region
- `data/nearby_systems.json`: cached systems within jump range
- `data/scan_latest.json`: most recent scan output
- `data/scan_latest.csv`: most recent scan output (flat table)
- `data/previous_scan.json`: data copy from earlier sample scan
