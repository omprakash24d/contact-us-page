
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from './_hooks/use-toast';
import { Loader2, Send, MailCheck, Mail, UploadCloud, File as FileIcon, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from './_lib/utils';
import { useContactForm } from './_hooks/use-contact-form';
import { contactFormSchema, type ContactFormValues } from './_lib/schema';

export default function ContactPage() {
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      attachment: undefined,
      honeypot: "",
    },
  });

  const { 
    isLoading, 
    isSubmitted, 
    uploadProgress, 
    successMessage,
    onSubmit, 
    handleReset 
  } = useContactForm({ form, toast });

  const attachment = form.watch("attachment");

  useEffect(() => {
    form.setFocus("name");
  }, [form]);


  if (isSubmitted) {
    return (
       <main className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-xl">
          <Card className="w-full shadow-lg">
            <CardContent className="flex flex-col items-center justify-center space-y-6 p-10 text-center">
                <MailCheck className="h-16 w-16 text-primary" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Message Sent!</h2>
                  <p className="text-muted-foreground">
                    {successMessage}
                  </p>
                </div>
                <Button onClick={handleReset} variant="outline" className="mt-4">
                  Send Another Message
                </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full items-start justify-center bg-muted/40 p-4 py-12 sm:p-6 md:p-8">
      <div className="w-full max-w-xl">
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
                <CardTitle className="text-2xl">Send a Message</CardTitle>
                <CardDescription>Fill out the form to get in touch.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} autoComplete="name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} autoComplete="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us what you're thinking about..."
                          className="resize-none"
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="attachment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attachment (Optional)</FormLabel>
                      <FormControl>
                        <div
                          className={cn({ "hidden": attachment?.[0] })}
                        >
                          <label
                            htmlFor="attachment-input"
                            className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">Max file size: 25MB</p>
                            </div>
                             <Input
                                id="attachment-input"
                                type="file"
                                className="hidden"
                                ref={field.ref}
                                onBlur={field.onBlur}
                                name={field.name}
                                onChange={(e) => field.onChange(e.target.files?.[0] ? e.target.files : undefined)}
                                disabled={isLoading}
                              />
                          </label>
                        </div>
                      </FormControl>
                      
                      {attachment?.[0] && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between p-2 pl-3 border rounded-md">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {attachment[0].name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(attachment[0].size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="ml-2 h-7 w-7 flex-shrink-0"
                              onClick={() => form.setValue('attachment', undefined, { shouldValidate: true })}
                              disabled={isLoading}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          {isLoading && (
                            <div className="mt-2 space-y-1">
                              <Progress value={uploadProgress} className="h-2" />
                            </div>
                          )}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="honeypot"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input {...field} tabIndex={-1} autoComplete="off" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
