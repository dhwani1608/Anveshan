import React from 'react';
import Link from 'next/link';
import { Cpu, Server, Shield, Brain, Layers, ArrowRight } from 'lucide-react';

export default function DepartmentsPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          Academic Departments
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white">
          Department of Computer Science & Engineering
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Pioneering undergraduate engineering, specialized tracks in AI/ML, Cloud Computing, and Cyber Security.
        </p>
      </div>

      {/* Research Labs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-sm">AI & GPU Supercomputing</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            High-performance GPU cluster for training deep learning models, LLMs, and computer vision algorithms.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 w-fit">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-sm">Cloud Computing & DevOps</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hands-on virtualization, Docker, Kubernetes clusters, and multi-cloud deployment testbeds.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 w-fit">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-sm">Cyber Security & Forensics</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Penetration testing laboratory, cryptography analysis, and ethical hacking sandbox environments.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-sm">IoT & Edge Computing</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Microcontroller prototyping, sensor networks, and edge inference devices for smart campus research.
          </p>
        </div>
      </div>

      {/* Featured Courses Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white font-serif">Key Department Courses & Prerequisites</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Course Title</th>
                <th className="p-3">Credits</th>
                <th className="p-3">Semester</th>
                <th className="p-3">Mandatory Prerequisites</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr>
                <td className="p-3 font-mono text-amber-400 font-bold">CS401</td>
                <td className="p-3 font-semibold text-white">Machine Learning</td>
                <td className="p-3">4 (3-1-0)</td>
                <td className="p-3">Semester 7</td>
                <td className="p-3 text-slate-400">CS201 Data Structures, CS302 Algorithms (Min Grade C)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-amber-400 font-bold">CS402</td>
                <td className="p-3 font-semibold text-white">Cloud Computing & DevOps</td>
                <td className="p-3">3 (3-0-0)</td>
                <td className="p-3">Semester 7</td>
                <td className="p-3 text-slate-400">CS303 Operating Systems, CS304 Networks</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-amber-400 font-bold">CS403</td>
                <td className="p-3 font-semibold text-white">Information & Cyber Security</td>
                <td className="p-3">3 (3-0-0)</td>
                <td className="p-3">Semester 7</td>
                <td className="p-3 text-slate-400">CS202 Discrete Math, CS304 Networks</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-amber-400 font-bold">CS421</td>
                <td className="p-3 font-semibold text-white">Deep Learning (Elective)</td>
                <td className="p-3">3 (3-0-0)</td>
                <td className="p-3">Semester 7</td>
                <td className="p-3 text-slate-400">CS401 Machine Learning (Min Grade B)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
