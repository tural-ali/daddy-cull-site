#!/usr/bin/env python3
"""Rewrites What's new in index.html from the app's own history.

Every feat: commit on the app's main is a new minor version, 0.<count of
feat: commits so far>, the way its tools/version.sh numbers releases. The
newest ten are listed, each with its version, the opening clause of its
message as a heading and what follows it under it, linked to the commit.

    tools/whats_new.py path/to/daddy-cull [index.html]
"""
import html
import re
import subprocess
import sys

REPO = "https://github.com/tural-ali/daddy-cull"
SHOWN = 10
START, END = "<!-- whats-new:start -->", "<!-- whats-new:end -->"
FEAT = re.compile(r"^feat(\([^)]*\))?!?: (.+)$")
# Where a message's clauses meet: a colon, a semicolon, or a comma before a
# word that starts a clause of its own.
JOINT = re.compile(r": |; |, (?=(?:and|so|as|while|where|which|with|then|instead|each|every|one|the|a|an|its|it|any|only|both|all|such)\b)")


def split(message):
    """The message's opening clause, as a heading, and what follows it up to
    the next semicolon, which is where a message moves on to a second change."""
    for joint in JOINT.finditer(message):
        if joint.start() >= 36:
            rest = message[joint.end():].split("; ", 1)[0]
            return message[:joint.start()].strip(), rest.strip()
    return message.strip(), ""


def sentence(text):
    return text[:1].upper() + text[1:]


def entries(app):
    log = subprocess.run(
        ["git", "-C", app, "log", "--reverse", "--format=%H%x00%s", "origin/main"],
        check=True, capture_output=True, text=True).stdout
    found, minor = [], 0
    for line in log.splitlines():
        commit, subject = line.split("\0", 1)
        match = FEAT.match(subject)
        if not match:
            continue
        minor += 1
        heading, rest = split(match.group(2))
        heading = sentence(heading)
        detail = sentence(rest) + "." if rest else ""
        found.append((f"0.{minor}", commit, heading, detail))
    return list(reversed(found))[:SHOWN]


def render(items):
    lines = []
    for version, commit, heading, detail in items:
        body = f"<h3><a href=\"{REPO}/commit/{commit}\">{html.escape(heading)}</a></h3>"
        if detail:
            body += f"<p>{html.escape(detail)}</p>"
        lines.append(f"      <li><span class=\"ver\">{version}</span><div>{body}</div></li>")
    return "\n".join(lines)


def main():
    app = sys.argv[1]
    page = sys.argv[2] if len(sys.argv) > 2 else "index.html"
    with open(page, encoding="utf-8") as f:
        text = f.read()
    before, rest = text.split(START, 1)
    _, after = rest.split(END, 1)
    updated = f"{before}{START}\n{render(entries(app))}\n      {END}{after}"
    if updated != text:
        with open(page, "w", encoding="utf-8") as f:
            f.write(updated)
        print("What's new updated.")
    else:
        print("What's new is up to date.")


if __name__ == "__main__":
    main()
