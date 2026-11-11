import { Link } from 'react-router-dom';
import { Star, Clock, Award, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Course, Testimonial, formatCurrency, getCheckoutPath } from '@/lib/index';
import { ReactNode } from 'react';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 300, damping: 35 }}
    >
      <Card className="h-full flex flex-col overflow-hidden border-border hover:shadow-lg transition-all duration-200">
        <div className="relative h-48 overflow-hidden">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
            {course.level}
          </Badge>
        </div>
        <CardHeader>
          <CardTitle className="text-xl">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span>{totalLessons} aulas</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Principais recursos:</p>
            <ul className="space-y-1">
              {course.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-4 border-t">
          <div className="w-full flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">{formatCurrency(course.price.oneTime)}</p>
              <p className="text-xs text-muted-foreground">pagamento único</p>
            </div>
            <div className="text-right text-xs font-medium text-muted-foreground">
              Acesso vitalício
            </div>
          </div>
          <Link to={getCheckoutPath(course.id)} className="w-full">
            <Button className="w-full" size="lg">
              Matricular Agora
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 300, damping: 35 }}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={testimonial.image} alt={testimonial.name} />
              <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-base">{testimonial.name}</CardTitle>
              <CardDescription className="text-sm">{testimonial.location}</CardDescription>
              <div className="flex gap-0.5 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed">{testimonial.text}</p>
          {testimonial.beforeIncome && testimonial.afterIncome && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Aumento de renda:</p>
              <div className="flex items-center gap-2">
                <span className="text-sm line-through text-muted-foreground">
                  {testimonial.beforeIncome}
                </span>
                <span className="text-sm">→</span>
                <span className="text-sm font-semibold text-primary">
                  {testimonial.afterIncome}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 300, damping: 35 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="h-full text-center hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            {icon}
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface BenefitCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 300, damping: 35 }}
    >
      <div className="flex gap-4 p-6 rounded-lg bg-card border border-border hover:shadow-md transition-all duration-200">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
