+++
date = '2025-10-17T17:09:06-04:00'
draft = false
title = 'Measuring Engineering Productivity'
description = 'A practical system for tracking engineering output without burying teams in metrics.'
+++

Engineers love to measure things: latency, throughput, error rates. But try to measure their own work? Then metrics become the enemy.

I get it. I've seen enough terrible systems to understand the resistance. Most systems fail, thanks to Goodhart's Law. Measure the lines of code written, and people start writing verbose code. Measure the number of PRs, and people start dividing up their submissions.

Yet, it all feels like you have to measure _something_. Every manager knows that some people are more productive than others. But even among the productive people, some are machines that churn out good stuff at a solid pace, while others are explosions; they seem to sit still for weeks and then burst out with amazing work. And of course, people have their natural ebb and flow; sometimes life just gets in the way. Yet, without a way to measure productivity and ascertain accountability, you are flying blind. 

People repeatedly asked me how we measured productivity at Felt. Over the course of 4.5 years, I arrived at a system that seemed to work. It's what worked for us; it encouraged and motivated the team to release products at an incredible pace. It allowed me to see where everyone stood and helped make adjustments where needed.

## Why Measure Things?

Here's the uncomfortable truth: you can measure engineering productivity. The goal is not to have a purely objective system where you stack rank people but rather to make it obvious to everyone, including the people being measured, the level of their output, especially compared to people around them.

Yes, outcomes matter most. We all want to ship features that users love, fix bugs that matter, and build systems that scale. **But outcomes are often a function of output**. You can't improve what you can't see, and you can't see what you don't measure.

## The North Star Principle: Don't Burden Your Engineers

The most important principle that guided everything: the bulk of the "paperwork" should fall on management, not individual contributors. Of course, it's important to keep the busywork to a minimum for productivity's sake. But more importantly, if you want a system that people won't try to game, overtly or covertly, you want a system people won't hate.

## The System

| Practice | Frequency | Engineer Overhead | What It Measures |
|----------|-----------|-------------------|------------------|
| Standup Messages in Slack | Daily | 5-10 min | Day-to-day progress and blockers |
| GitHub Changelogs | Weekly | None | Volume and type of work shipped |
| Manager 1:1s | Weekly | None | Context and patterns over time |
| All-Hands Presentations | Weekly | ~10 min | Team accomplishments |
| PR Notifications | Real-time | None | Ambient awareness |
| Deploy Verifications | Per deploy | 2-5 min | Ownership and quality |


### Daily

We did not have daily standups. However, every engineer was required to post a message in a dedicated Slack channel (called #standups) with three things:

1. What I did yesterday
2. What I plan to do today
3. Any blockers.

That's it. It took every engineer around 5-10 minutes to do this per day.

The engineers were asked to be as succinct as possible. A good standup message (more on this later) would include links to GitHub PRs or Linear issues. Often, most engineers didn't have any blockers. The key is that we asked managers to actually keep tabs on these messages and notify their reports if they missed posting a message.

## Weekly: The Three Layers

### Automated (Mostly) GitHub Changelogs

At the end of every week (generally Friday), we compiled a changelog using GitHub's built-in Release tool. This release wasn't particularly meaningful since we built a SaaS product that was continuously deployed, but the Changelog was. 

Since the Changelog included every engineer's GitHub username next to the merged PR, it allowed a very quick visual reference to see how many changes from each engineer went in at a given week.

We also categorized the PRs in the changelog (manually, since it predated ChatGPT) into sections such as "Features", "Bug Fixes", and "Dev Ex". This was important because it allowed us to see who was working on what kind of things. Most engineers love to spend time on their tooling, and that's important for both productivity and personal reasons. But we wanted to make sure people weren't spending all their time on them.

### Manager 1:1s

Every individual contributor (and really, every employee, including myself) had a weekly 1:1 with their manager. While this meeting was mostly *not about* their work, it was a part of it. A good 1:1 format I've used is the "People, Product, Process".

I often started with the "Product" by asking "What have you been working on?" The key was to make sure it was me, the manager, taking notes. I used a shared Notion document that had an H2 headline for each week and H3 headlines for each item of the "People, Product, Process" trifecta.

This way, it was very easy for me to see what people said they were working on week over week: all I had to do was open up a few weeks' worth of H2s and compare the "Product" sections under each. Since this Notion doc was shared with my report and I took notes as we spoke, there was no debate.

This also captured context that doesn't show up in commits. Why did you spend three days refactoring that module? What made you decide to investigate that performance issue? What's blocking you from finishing that feature?

Again, this "Product" section often was the smallest part of a 1:1 — not more than 10, 15 minutes of a 45-minute meeting. It's also why I often did this part first. 

### Company All-Hands

Every week, we had a company All-Hands for around an hour. A 15-minute section of that meeting was set aside for each team in the company to present their work from the past week.

At the beginning of each All-Hands, teams would break out into their own rooms and would have 7-8 minutes to put together a quick presentation (using our own tool) to paste in screenshots, graphics, or whatever they thought was useful and pick a speaker. 

Later, when the entire team got together, the designated speaker had 2-3 minutes to go through their team's work in front of the whole company.

This format not only allowed cross-team awareness, but also created artifacts we, the management, could go through week over week. It also created visibility through accountability. When you know you'll be presenting your work to the company, you ship things you're proud of.

## Real-Time

### First: PR Notifications

We piped all the merged GitHub PRs into a public Slack channel. This wasn't always useful and after a few more engineers joined, it became more "watching the Matrix" than anything.

While we never really used this as evidence of anything, it created an ambient sense of what was going on.

### Later: Deploy Verifications

Over time, the above system got quite advanced. We developed a sophisticated system where every single approved (and tested) PR would get deployed immediately. In lieu of a staging environment, we had preview environments and engineers loved the ability to get their code out into production without fanfare.

However, in order to make sure things actually worked as designed (and because we started having bugs), we required our engineers to verify their PRs in production.

Again, we automated almost all of this — after each deploy, we'd create a new Slack message in a designated room and tag the person (in Slack) whose PR just got deployed. All the engineers had to do was verify their PR (by posting a message under that thread on how they verified it) and add a ✅ emoji. 

Similar to the PR notifications, this system wasn't used as evidence as much as it created a culture of high-cadence. It became very obvious how many deploys were going out and whose PRs were in them, which became motivating for most people.

## Overview

As you saw, while there were many parts to this system, it required practically zero overhead from individual contributors. 

Aside from people writing their standup messages, the work was either done by management or things engineers should have been doing anyway as part of a continuous delivery cycle.

## Implementation Notes

Before you go out and implement this system at your company, it behooves me to share some thoughts. I hope what I'm going to share here is obvious to most people, but well, more on that in a second.

### Take your time

Most of what you've read came together over the course of 2 years. We did not start with 18 engineers divided across 3 teams. The first incarnation was simply the standup messages and the real-time deploy messages on Slack. Soon, we added our All-Hands presentations. The rest came in as we needed them.

If you tried to implement all of this at once, you'd get a mutiny and your engineers would be right. Start with one or two. It will feel annoying for a bit. Power through it, and if it works, consider the rest.

### Context Matters Enormously

Needless to say, this system worked for my company as we grew from 2 to 25 people. We were divided into 2 or 3 teams and mostly worked in the same timezone remotely. We built a SaaS product that was delivered continuously, sometimes even doing 25 deploys a day.

Don't cargo-cult this system. Understand the principles—minimal engineer overhead, maximum visibility, automation over process—and adapt them to your context.

### Be extremely explicit in your expectations.

When we introduced daily standups, we didn't just say "post what you're working on." We provided examples. Literal examples of good and bad standup messages.

Good standup message: "Yesterday: Finished the OAuth integration, all tests passing. Today: Starting on the password reset flow. Blockers: Need design feedback on the reset email template."

Bad standup message: "Working on auth stuff."

Same thing for changelogs. Same thing for All-Hands presentations. We showed people exactly what we wanted to see.

Be more explicit than you think you need to be. What seems obvious to you is not obvious to everyone. Provide examples. Provide templates. Show, don't just tell.

### Be open to feedback

As I mentioned, one-third of my 1:1s was about "Process". I always directly asked people "Anything we can be doing to make you more productive or happier?". This is where people often shared their dislikes about some of what I just talked about. 

Similarly, as part of our regular "Engineering All-Hands" (which we held every 2-3 weeks), we often had a "Tools and Processes Retro" every few months. This was another place where people could express their thoughts.

That is not to say we always did what everyone asked for. Posting daily standup messages was often unpopular, but it was required for a remote team. The deploy verifications were another common pain point (due to deploys sometimes getting delayed behind other deploys) so we relaxed the requirements to check them daily versus "immediately after deploys".

### It's not about the numbers, but numbers matter

I opened this talking about measurement, but you'll notice that the system wasn't about the numbers as much as creating a culture of cadence and high-performance output which resulted in quick outcomes.

At the same time, we did sometimes measure things — often as a way to verify our intuitions and assumptions. Whenever we felt like someone was falling behind, we quickly gathered their recent contributions from various artifacts and calibrated against their teammates. We didn't do anything anyone else couldn't have done for themselves.

There were times when we were right but also times when the numbers told us that someone was working on something really complicated — there were a lot of PRs but not a lot of deploys. That was our hint that we didn't scope the project correctly. 

And yes, there were also times the numbers told us that someone was falling behind. Since we used practically all public numbers, that made a hard conversation about performance at least slightly easier by grounding things in reality versus feelings.

## Measurement as a Tool, Not a Weapon

Here's what I want you to take away from this: measurement isn't the enemy. Bad measurement is the enemy.

When you measure the wrong things—lines of code, number of commits, hours logged—you create dysfunction. When you burden engineers with measurement overhead, you not only reduce productivity instead of improving it, but also create enemies. When you use metrics as a weapon to punish people, you destroy trust.

But when you measure thoughtfully, with respect for people's time and a focus on visibility rather than control, measurement becomes valuable. It helps you see what's actually happening. It helps you identify problems early. It helps you understand patterns and improve over time. It helps you, as well as the people being measured.

The system should work for your engineers, not against them. If your measurement system makes engineers less productive, you've failed. If it makes them feel surveilled and distrusted, you've failed. If it becomes an end in itself rather than a means to building better products, you've failed.

Build a system that gives you visibility while letting engineers focus on what they do best: engineering. That's the goal. Everything else is details.
