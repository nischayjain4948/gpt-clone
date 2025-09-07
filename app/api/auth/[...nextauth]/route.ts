import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
   debug: true,  
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {

      console.log(profile);
      if (account && profile) {
        token.id = profile.sub;
        token.name = profile.name;
        token.email = profile.email;
        
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
