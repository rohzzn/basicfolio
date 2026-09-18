import React from 'react';
import PostReads from '@/components/PostReads';
import PostFilm from '@/components/PostFilm';
import Link from 'next/link';
import Thread from './Thread';

export default function NobodySaidHeWasWrong() {
  return (
    <article className="max-w-3xl pb-8 pt-0 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-paper">Nobody Said He Was Wrong</h1>
          <Link
            href="/writing"
            className="text-xs text-zinc-500 dark:text-neutral-400 hover:text-zinc-700 dark:hover:text-neutral-300 transition-colors flex-shrink-0 mt-1"
          >
            writing
          </Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-neutral-400 text-sm">
          <time dateTime="2026-09-10">Sep 2026</time>
          <PostReads />
        </div>
      </header>

      <PostFilm slug="nobody-said-he-was-wrong" />

      <div className="text-sm max-w-3xl">
        <p className="text-zinc-600 dark:text-neutral-400 mb-4">
          On Tuesday night a researcher named Jacob Coxon resigned from Anthropic and posted a thread
          about why. He had spent three years doing pretraining research, first at OpenAI and then at
          Anthropic. His summary of both places: neither is acting responsibly, and they are gambling
          with our lives.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-6">
          Researchers quit companies and write threads about it constantly. I would normally not
          read past the first post. Here is the whole thing, and then the reply that made me stop.
        </p>

        <Thread />

        <h2 className="text-base font-medium mt-10 mb-4 dark:text-paper">The reply is the story</h2>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4">
          Eighty-three minutes after the thread went up, Evan Hubinger quote-tweeted the third post
          to agree with it. Hubinger runs Alignment Science at Anthropic. That is the team whose
          entire job is making sure the models do what we want them to do. He is not a critic, not a
          competitor, not someone with a book to sell. He is the person you would expect to write the
          rebuttal.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4">
          Instead he wrote that Jacob is correct, that they really do earnestly believe AI could kill
          all humans, and that he personally puts it above ten percent within the next decade. He
          added that Anthropic is trying its best but does not yet have a plan to solve alignment for
          superintelligence and is not clearly on track to.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4">
          He posted this under his own name, from an account whose bio says “opinions my own,” while
          employed there. Nobody made him. The company did not put out a statement contradicting him.
          The thread and the reply have something like two hundred million views between them, and as
          far as I can tell the response from inside the industry was a nod.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-paper">
          What that number would mean anywhere else
        </h2>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4">
          I want to be careful here because I am not qualified to evaluate the estimate. I do not
          know how you would build a model that outputs ten percent rather than one percent or fifty,
          and I am suspicious of anyone who speaks confidently about a probability distribution over
          the end of the world. That includes the optimists.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4">
          But I do know what we do with numbers like that in every other field. A one in ten chance
          of killing everyone on board is not a risk tolerance, it is a grounded fleet. No regulator
          on earth would let a bridge, a drug, a reactor, or a food additive ship with a failure
          estimate in that range, and the failure in those cases is measured in a building, a town, a
          bad decade. We have an enormous, boring, expensive apparatus of inspections and trials and
          certifications built specifically to push risks down into the parts per million, and we
          built it for things that can only go so wrong.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-6">
          The thing being described here has no ceiling on how wrong it can go, and the estimate is
          coming from the safety lead of the company doing it. That combination has no precedent I
          can think of. The closest analogy people reach for is the Manhattan Project, and that was a
          government program in a world war, not a product with a subscription tier.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-paper">So how are we here</h2>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4">
          Coxon answers this himself, in the fourth post, and his answer is the most useful part of
          the thread. The obvious objection to anyone claiming this is dangerous is: then why are you
          building it? His account is that the two labs fail differently. At OpenAI, he says, many
          people have not really internalized the stakes. At Anthropic, the stakes are understood
          perfectly well, and they build anyway because they believe nobody else will act responsibly,
          so it has to be them.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4">
          That second one is not stupidity. It is a coordination failure, and it is the most familiar
          shape in the world. Every actor makes the locally rational choice. If I stop, someone less
          careful wins the race, so stopping makes things worse. Everyone reasons this way
          simultaneously, everyone keeps going, and the collective outcome is one that no individual
          participant would have chosen. We have a century of literature about this, mostly written
          about fisheries and emissions and arms.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4">
          The version we have now is the same structure with the stakes moved up and the referee
          removed. Coxon puts it better than I can: this is not a decision that should be launched
          from a private company&apos;s Slack. There is no body that can say stop, no treaty, no
          licensing regime, no equivalent of the FDA. The people deciding how fast to go are the same
          people who benefit from going fast, and they are aware of this, and they are doing it
          anyway because the alternative is to lose.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-6">
          That is the honest answer to how we got into a situation where this is a discussion. Not
          malice, not stupidity, not some cartoon of a villain. A race that nobody can unilaterally
          exit, run by people who know exactly what they are running, in a regulatory vacuum, funded
          by the most enthusiastic capital markets in living memory.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-paper">
          The part where I am implicated
        </h2>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4">
          I should be honest that I am not an observer here. I use these models every day. Parts of
          this website were built with one sitting next to me. I have written posts on this same page
          about which AI features I like and which ones are wasted effort, in the tone of somebody
          reviewing a laptop. If the estimate is anywhere near right, that tone is insane, and it is
          mine.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4">
          I do not have a clean resolution for that. I am not going to announce that I am quitting
          the tools; I would be lying, and one developer abstaining changes nothing about the race
          anyway. What I can do is stop treating the topic as a genre. The safety conversation has
          become a kind of content, with recognizable characters and a comment section, and
          participating in it as content is a way of not participating in it at all.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-paper">
          What a non-expert can actually judge
        </h2>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4">
          I cannot check the number. Most people cannot. But there is something adjacent that anyone
          can check, and it does not require any technical background: who disputed it.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4">
          A researcher publicly accused his employer of gambling with human lives. The natural
          corporate response is a denial, or silence, or a carefully worded post about how the
          departing employee misunderstood the safety framework. What happened instead is that the
          person in charge of alignment science said, in public, that the guy was right and here is
          my own number. The disagreement between the person who quit and the person who stayed is
          not about whether the risk is real. It is about whether staying helps.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-6">
          That is a genuinely strange thing to be able to observe from the outside, and it is the
          strongest evidence available to someone like me. Not the probability, which I cannot
          evaluate. The absence of anyone qualified standing up to say it is nonsense.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-paper">And then it was Wednesday</h2>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4">
          A hundred and sixty million people saw the first post. That is not a niche safety forum,
          that is a substantial fraction of everyone online. And then the news cycle moved, and the
          products shipped, and the funding rounds closed, and I went back to work, and so did
          everyone who read it.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4">
          The striking thing about this week is not that somebody said AI might kill everyone. People
          have been saying that for years, and a reasonable person can file it under things loud
          people say. The striking thing is the specific combination: an insider says it, the
          company&apos;s own safety lead confirms it with a number, hundreds of millions of people
          read it, and nothing about anyone&apos;s Wednesday changes.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400">
          I do not know what the correct reaction is. I am fairly sure this was not it.
        </p>
      </div>
    </article>
  );
}
