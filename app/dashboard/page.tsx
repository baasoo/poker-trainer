"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserStats {
  total_games_played: number;
  total_score: number;
  average_accuracy: number;
  best_round_score: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [status, router]);

  if (status === "loading" || !session) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {/* Top nav bar */}
      <div className="dashboard-nav">
        <div>
          <h2 className="dashboard-nav-title">Dashboard</h2>
          <p className="dashboard-nav-subtitle">Welcome back, {session.user.name}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="btn btn-ghost"
        >
          Sign Out
        </button>
      </div>

      {/* Main content */}
      <div className="dashboard-content">
        {/* Stats Grid */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <p className="stat-label">Total Games</p>
            <p className="stat-value stat-value-green">
              {loading ? "..." : stats?.total_games_played || 0}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Average Score</p>
            <p className="stat-value stat-value-violet">
              {loading ? "..." : (stats?.average_accuracy || 0).toFixed(1) + "%"}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Best Game</p>
            <p className="stat-value stat-value-cyan">
              {loading ? "..." : (stats?.best_round_score || 0).toFixed(1) + "%"}
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="dashboard-cta">
          <p className="dashboard-cta-eyebrow">Ready to train?</p>
          <h3 className="dashboard-cta-heading">Test your poker intuition</h3>
          <Link
            href="/game/new"
            className="btn btn-primary dashboard-cta-button"
          >
            Start New Session →
          </Link>
        </div>
      </div>
    </div>
  );
}

