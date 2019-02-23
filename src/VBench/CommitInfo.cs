using System;

namespace Acklann.VBench
{
    public class CommitInfo
    {
        public DateTime Date { get; internal set; }

        public bool WasClean { get; internal set; }

        public string Branch { get; internal set; }

        public string Sha { get; internal set; }

        public string Message { get; set; }

        public string Author { get; internal set; }

        public string Email { get; set; }
    }
}