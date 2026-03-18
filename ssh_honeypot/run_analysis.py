import os
import sys
import json
import datetime
import argparse
import logging
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress

from mongo_logger import MongoLogger
from sentiment_analyzer import SentimentAnalyzer

console = Console()
logging.basicConfig(level=logging.WARNING)


def analyze_all_sessions(mongo, sentiment):
    """Run analysis on all recorded sessions."""
    sessions = mongo.get_all_sessions()
    if not sessions:
        console.print("[yellow]No sessions found in database.[/yellow]")
        return []

    results = []
    with Progress() as progress:
        task = progress.add_task("[cyan]Analyzing sessions...", total=len(sessions))
        for session in sessions:
            sid = session["session_id"]
            analysis = sentiment.analyze_session(sid)
            if analysis:
                analysis["ip"] = session.get("attacker_ip", "unknown")
                analysis["username"] = session.get("username_tried", "unknown")
                analysis["password"] = session.get("password_tried", "unknown")
                analysis["start_time"] = session.get("start_time", "")
                analysis["duration"] = ""
                if session.get("start_time") and session.get("end_time"):
                    delta = session["end_time"] - session["start_time"]
                    analysis["duration"] = f"{int(delta.total_seconds())}s"
                results.append(analysis)
            progress.advance(task)

    return results


def display_results(results):
    """Display analysis results in a rich table."""
    if not results:
        return

    table = Table(title="🔍 Attacker Session Analysis", show_lines=True)
    table.add_column("Session", style="cyan", width=10)
    table.add_column("IP Address", style="white")
    table.add_column("Creds", style="yellow")
    table.add_column("Cmds", style="white", justify="right")
    table.add_column("Sophistication", style="bold")
    table.add_column("Frustration", justify="right")
    table.add_column("Phase", style="magenta")
    table.add_column("Intents", style="blue")
    table.add_column("MITRE", style="red")

    for r in results:
        soph = r.get("sophistication_level", "unknown")
        soph_color = {"advanced": "red", "intermediate": "yellow", "beginner": "green", "script_kiddie": "dim"}.get(soph, "white")
        frust = r.get("frustration_score", 0)
        frust_bar = _bar(frust)
        intents = ", ".join(r.get("intent_classification", [])[:2])
        mitre = ", ".join(r.get("technique_fingerprint", [])[:3])

        table.add_row(
            r.get("session_id", "")[:8],
            r.get("ip", "unknown"),
            f"{r.get('username', '?')}:{r.get('password', '?')[:8]}",
            str(r.get("total_commands", 0)),
            f"[{soph_color}]{soph.upper()}[/{soph_color}]",
            frust_bar,
            r.get("behavioral_phase", "").replace("_", " "),
            intents,
            mitre,
        )

    console.print(table)

    for r in results:
        summary = r.get("summary", "No summary available.")
        console.print(Panel(
            f"[bold]Session:[/bold] {r.get('session_id', '')[:8]} | "
            f"[bold]IP:[/bold] {r.get('ip', 'unknown')} | "
            f"[bold]Duration:[/bold] {r.get('duration', 'N/A')}\n\n"
            f"{summary}\n\n"
            f"[dim]Escalation trajectory: {' → '.join(r.get('escalation_trajectory', []))}[/dim]",
            title=f"📋 Detailed Analysis — {r.get('session_id', '')[:8]}",
            border_style="blue",
        ))


def export_json(results, filepath):
    """Export results to JSON."""
    def serializer(obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        return str(obj)

    with open(filepath, "w") as f:
        json.dump(results, f, indent=2, default=serializer)
    console.print(f"[green]Results exported to {filepath}[/green]")


def _bar(value, width=10):
    """Create a visual bar for a 0-1 value."""
    filled = int(value * width)
    empty = width - filled
    color = "green" if value < 0.3 else "yellow" if value < 0.6 else "red"
    return f"[{color}]{'█' * filled}{'░' * empty}[/{color}] {value:.0%}"


def main():
    parser = argparse.ArgumentParser(description="Ghost in the Machine — Session Analyzer")
    parser.add_argument("--session", "-s", help="Analyze a specific session ID")
    parser.add_argument("--export", "-e", help="Export results to JSON file")
    parser.add_argument("--active", "-a", action="store_true", help="Only analyze active sessions")
    parser.add_argument("--top", "-t", type=int, default=0, help="Show top N riskiest sessions")
    args = parser.parse_args()

    console.print(
        "\n[bold red]👻 GHOST IN THE MACHINE[/bold red] — "
        "[dim]Behavioral Analysis Engine[/dim]\n"
    )

    mongo = MongoLogger()
    sentiment = SentimentAnalyzer(mongo)

    if args.session:
        analysis = sentiment.analyze_session(args.session)
        if analysis:
            session = mongo.get_session(args.session)
            analysis["ip"] = session.get("attacker_ip", "unknown") if session else "unknown"
            display_results([analysis])
        else:
            console.print(f"[red]Session {args.session} not found.[/red]")
    else:
        results = analyze_all_sessions(mongo, sentiment)

        if args.active:
            results = [r for r in results if r.get("active")]

        if args.top > 0:
            results.sort(key=lambda x: x.get("sophistication_score", 0), reverse=True)
            results = results[:args.top]

        display_results(results)

        if args.export:
            export_json(results, args.export)

    stats = mongo.get_stats()
    console.print(Panel(
        f"[bold]Total Sessions:[/bold] {stats['total_sessions']}  |  "
        f"[bold]Active:[/bold] {stats['active_sessions']}  |  "
        f"[bold]Commands:[/bold] {stats['total_commands']}  |  "
        f"[bold]Exploits:[/bold] {stats['total_exploits']}  |  "
        f"[bold]Creds Captured:[/bold] {stats['total_credentials']}  |  "
        f"[bold]High Risk:[/bold] {stats['high_risk_sessions']}",
        title="📊 Database Statistics",
        border_style="green",
    ))

    mongo.close()


if __name__ == "__main__":
    main()
