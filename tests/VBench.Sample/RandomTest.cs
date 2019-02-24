using BenchmarkDotNet.Attributes;
using System.Threading;

namespace VBench.Sample
{
    [RankColumn]
    public class RandomTest
    {
        [Benchmark(Baseline = true)]
        public void AlgoA() => Thread.Sleep(1100); // s

        [Benchmark]
        public void AlgoB() => Thread.Sleep(1200); // ms

        [Benchmark]
        public void AlgoC() => Thread.Sleep(1300); // ns

        private void DoNothing()
        {
        }
    }
}