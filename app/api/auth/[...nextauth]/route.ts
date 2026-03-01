import NextAuth from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: { 
        params: { 
          scope: "openid profile email offline_access Files.ReadWrite.All",
          prompt: "consent" 
        } 
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' }, // explicit for reliable token persistence
  callbacks: {
    async jwt({ token, account }) {
      console.log("JWT callback - account exists?", !!account);
      if (account?.access_token) {
        token.accessToken = account.access_token;
        console.log("✅ Graph access token SAVED to JWT");
      } else if (token.accessToken) {
        console.log("✅ Graph access token PRESERVED from previous JWT");
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken as string;
      console.log("✅ Session updated with Graph token (length:", token.accessToken ? token.accessToken.length : 0, ")");
      return session;
    },
  },
});

export { handler as GET, handler as POST }
