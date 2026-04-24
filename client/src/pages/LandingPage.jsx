import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-20 py-6">
      {/* 🔷 HERO / ABOUT */}
      <motion.section
        id="about"
        className="scroll-mt-24 text-center space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Know your <span className="text-sky-300">professors better</span>.
        </h1>

        <p className="text-(--ui-muted-text) max-w-2xl mx-auto">
          RateMyProfessor is built to bring transparency into academics. Students share real classroom experiences,
          helping others understand how a professor actually teaches — including clarity, behavior, and difficulty level.
        </p>

        <p className="text-(--ui-muted-text) max-w-xl mx-auto">
          This is not about choosing professors for your semester — it's about being informed, aware, and prepared.
        </p>

        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={() => navigate('/register')}>
            Get Started
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/login')}>
            Login
          </Button>
        </div>
      </motion.section>

      {/* 🔷 FEATURES */}
      <motion.section
        id="features"
        className="scroll-mt-24 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold text-center">Core Features</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-sky-400/30 shadow-sm">
            <CardContent className="p-6 space-y-2">
              <h3 className="font-semibold text-lg">For Students</h3>
              <ul className="text-sm text-(--ui-muted-text) space-y-1">
                <li>• Honest and anonymous reviews</li>
                <li>• Subject-wise professor ratings</li>
                <li>• Insights into teaching style</li>
                <li>• Real student experiences</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-2">
              <h3 className="font-semibold text-lg">For Admins</h3>
              <ul className="text-sm text-(--ui-muted-text) space-y-1">
                <li>• Manage professor database</li>
                <li>• Moderate reviews</li>
                <li>• Secure access (JWT)</li>
                <li>• Maintain platform quality</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* 🔷 HOW IT WORKS */}
      <motion.section
        id="how"
        className="scroll-mt-24 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-semibold text-center">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Search",
              desc: "Find any professor and view their profile."
            },
            {
              title: "Explore Reviews",
              desc: "Read real feedback from students who attended classes."
            },
            {
              title: "Share Experience",
              desc: "Contribute your own honest review to improve transparency."
            }
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ scale: 1.05 }}>
              <Card className="shadow-md hover:shadow-lg transition">
                <CardContent className="p-6 text-center space-y-3">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-(--ui-muted-text)">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 🔷 CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center bg-linear-to-r from-sky-500/10 to-blue-500/10 rounded-3xl p-10 shadow-inner"
      >
        <h2 className="text-2xl font-semibold mb-2">
          Build a more transparent academic community
        </h2>
        <p className="text-(--ui-muted-text) mb-5">
          Share your experience and help others understand professors better.
        </p>

        <Button size="lg" onClick={() => navigate('/register')}>
          Create Account
        </Button>
      </motion.section>

    </div>
  )
}